// @ts-check
// Que la web funcione sin internet: registra el service worker (sw.js), sabe
// si ya esta todo guardado en el aparato, avisa cuando hay version nueva y
// ofrece instalar la web como una app.
//
// En localhost no se registra: quien esta editando el codigo veria la copia
// guardada en vez de sus cambios. Para probarlo en local: ?sw=1 en la URL.

import { emit } from './events.js';

/**
 * @typedef {'unsupported' | 'local' | 'installing' | 'ready' | 'update' | 'error'} OfflineState
 * @typedef {{ state: OfflineState, version?: string, saved?: number, total?: number }} OfflineStatus
 */

/** @type {OfflineStatus} */
let status = { state: 'unsupported' };
/** @type {ServiceWorkerRegistration | null} */
let registration = null;
/** @type {any} */
let installPrompt = null;
/** El profesor pulso "Reload": cuando entre la version nueva, se recarga. */
let updateAsked = false;

/** @param {OfflineStatus} next */
function setStatus(next) {
  status = { ...status, ...next };
  emit('offline:status', status);
}

export const offlineStatus = () => status;

/** ¿Se puede ofrecer "Install"? (Chrome y Edge lo dicen con beforeinstallprompt.) */
export const canInstall = () => Boolean(installPrompt);

/** Pide al navegador que instale la web como una app. */
export async function install() {
  if (!installPrompt) return false;
  const prompt = installPrompt;
  installPrompt = null;
  prompt.prompt();
  const choice = await prompt.userChoice.catch(() => null);
  emit('offline:install', canInstall());
  return choice?.outcome === 'accepted';
}

/** Pregunta al service worker cuantos archivos tiene guardados. */
async function askVersion() {
  // Tras una recarga forzada la pagina no tiene controller, pero el service
  // worker activo existe y ya lo tiene todo guardado: se le pregunta a el.
  const worker = navigator.serviceWorker?.controller ?? registration?.active ?? null;
  if (!worker) return;
  const channel = new MessageChannel();
  const answer = new Promise((resolve) => {
    channel.port1.onmessage = (event) => resolve(event.data);
    setTimeout(() => resolve(null), 3000);
  });
  worker.postMessage({ type: 'version' }, [channel.port2]);
  const data = /** @type {any} */ (await answer);
  if (data) setStatus({ state: status.state === 'update' ? 'update' : 'ready', version: data.version, saved: data.saved, total: data.total });
}

/** Activa la version que espera y recarga (lo pulsa el profesor). */
export function applyUpdate() {
  updateAsked = true;
  const waiting = registration?.waiting;
  // Si ya no hay nada esperando (otra pestana la activo), basta con recargar.
  if (waiting) waiting.postMessage({ type: 'skip-waiting' });
  else window.location.reload();
}

/**
 * Pide al navegador que no borre los datos de esta web cuando le falte
 * espacio. Safari borra lo guardado de las webs que no se abren en una
 * semana, salvo que esten instaladas en la pantalla de inicio.
 */
export async function keepData() {
  try {
    return Boolean(await navigator.storage?.persist?.());
  } catch {
    return false;
  }
}

export function startOffline() {
  window.addEventListener('beforeinstallprompt', (/** @type {any} */ event) => {
    event.preventDefault();
    installPrompt = event;
    emit('offline:install', true);
  });

  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    setStatus({ state: 'unsupported' });
    return;
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  if (local && !/[?&]sw=1\b/.test(window.location.search)) {
    // Uno que quedara de probar con ?sw=1 seguiria sirviendo codigo viejo.
    navigator.serviceWorker?.getRegistrations?.()
      .then((all) => all.forEach((reg) => reg.unregister()))
      .catch(() => {});
    setStatus({ state: 'local' });
    return;
  }

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    // Entra una version nueva: se recarga si se pidio con "Reload" o si la
    // pagina ya la llevaba una version anterior. La primera vez que el service
    // worker toma el control (primera visita) no hace falta.
    if (updateAsked || hadController) {
      reloading = true;
      window.location.reload();
      return;
    }
    askVersion();
  });

  setStatus({ state: hadController ? 'ready' : 'installing' });
  // updateViaCache 'none': al buscar version nueva, precache-list.js se pide
  // de verdad y no a la cache del navegador. Sin esto, como sw.js no cambia
  // (solo cambia la lista), una version nueva no se detectaba nunca.
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((reg) => {
    registration = reg;
    const watch = (/** @type {ServiceWorker | null} */ worker) => {
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) setStatus({ state: 'update' });
        if (worker.state === 'activated') askVersion();
        if (worker.state === 'redundant' && !navigator.serviceWorker.controller) setStatus({ state: 'error' });
      });
    };
    if (reg.waiting && navigator.serviceWorker.controller) setStatus({ state: 'update' });
    watch(reg.installing);
    reg.addEventListener('updatefound', () => watch(reg.installing));
    askVersion();
  }).catch(() => setStatus({ state: 'error' }));
}
