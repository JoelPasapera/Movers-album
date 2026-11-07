// @ts-check
// Entrada de voz. Hay dos caminos y son muy distintos en privacidad:
//
// 1. GRABAR (MediaRecorder). El audio no sale nunca del aparato. Sirve para que
//    el nino se escuche a si mismo. Funciona en todos los navegadores modernos.
//
// 2. RECONOCER (SpeechRecognition). Chrome y Edge envian el audio a servidores
//    de Google para transcribirlo. Es voz de menores saliendo del dispositivo,
//    asi que va APAGADO por defecto y hay que encenderlo a mano. Mientras esta
//    encendido, la barra de arriba lo dice en todas las pantallas.
//
// Las dos cosas necesitan https o localhost. Con `npx serve` funciona.

import { emit } from './events.js';

/** @returns {any} */
const recognitionClass = () => (typeof window === 'undefined' ? null
  : /** @type {any} */ (window).SpeechRecognition || /** @type {any} */ (window).webkitSpeechRecognition || null);

let recognitionAllowed = false;
/** Lo que esta escuchando ahora mismo: apagar el reconocimiento lo corta. */
const running = new Set();

export const recognitionSupported = () => Boolean(recognitionClass());

export const recorderSupported = () => Boolean(
  typeof window !== 'undefined' && /** @type {any} */ (window).MediaRecorder && navigator.mediaDevices?.getUserMedia,
);

export const secureEnough = () => window.isSecureContext
  || ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const isRecognitionAllowed = () => recognitionAllowed;

/**
 * Enciende o apaga el reconocimiento. Avisa con 'speech:recognition' para que
 * los interruptores y el aviso de la barra se pongan al dia a la vez.
 * @param {boolean} value
 */
export function allowRecognition(value) {
  recognitionAllowed = Boolean(value) && recognitionSupported();
  // Apagarlo corta tambien lo que estuviera escuchando, y lo que ya se oyo se
  // tira: si no, la voz seguiria saliendo del aparato con el aviso ya quitado.
  if (!recognitionAllowed) for (const cancel of [...running]) cancel();
  emit('speech:recognition', recognitionAllowed);
  return recognitionAllowed;
}

/**
 * Escucha una respuesta y devuelve el texto. La funcion que devuelve corta:
 * `stop()` termina y entrega lo oido; `stop(true)` lo tira (ni onEnd ni
 * onResult se vuelven a llamar).
 * @param {{ onResult?: (r: { text: string, final: boolean }) => void, onEnd?: (text: string) => void,
 *   onError?: (code: string) => void, lang?: string }} [handlers]
 * @returns {(discard?: boolean) => void}
 */
export function listen({ onResult, onEnd, onError, lang = 'en-GB' } = {}) {
  const Recognition = recognitionClass();
  if (!Recognition || !recognitionAllowed) {
    onError?.('unavailable');
    return () => {};
  }
  const engine = new Recognition();
  engine.lang = lang;
  engine.interimResults = true;
  engine.maxAlternatives = 3;
  engine.continuous = false;

  let finalText = '';
  let discarded = false;
  const cancel = () => {
    discarded = true;
    running.delete(cancel);
    try { engine.abort(); } catch { /* ya parado */ }
  };
  running.add(cancel);
  engine.addEventListener('result', (/** @type {any} */ event) => {
    if (discarded) return;
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += chunk;
      else interim += chunk;
    }
    onResult?.({ text: `${finalText} ${interim}`.trim(), final: Boolean(finalText) });
  });
  engine.addEventListener('error', (/** @type {any} */ event) => { if (!discarded) onError?.(event.error); });
  engine.addEventListener('end', () => {
    running.delete(cancel);
    if (!discarded) onEnd?.(finalText.trim());
  });

  try {
    engine.start();
  } catch {
    running.delete(cancel);
    onError?.('start-failed');
  }
  return (discard = false) => {
    if (discard) return cancel();
    try { engine.stop(); } catch { /* ya parado */ }
  };
}

/**
 * Graba y devuelve un blob local. No sube nada a ninguna parte.
 * `stop()` devuelve la grabacion; `cancel()` la tira. Las dos apagan el
 * microfono (el piloto rojo del navegador se apaga).
 * @returns {Promise<{ stop: () => Promise<Blob | null>, cancel: () => void }>}
 */
export async function record() {
  if (!recorderSupported()) throw new Error('unsupported');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  /** @type {Blob[]} */
  const chunks = [];
  const release = () => stream.getTracks().forEach((track) => track.stop());
  const MR = /** @type {any} */ (window).MediaRecorder;
  /** @type {any} */
  let recorder;
  try {
    recorder = new MR(stream);
    recorder.addEventListener('dataavailable', (/** @type {any} */ event) => {
      if (event.data.size) chunks.push(event.data);
    });
    recorder.start();
  } catch (error) {
    // El microfono ya estaba abierto: si grabar falla, se apaga.
    release();
    throw error;
  }

  return {
    stop: () => new Promise((resolve) => {
      let done = false;
      /** @param {Blob | null} blob */
      const finish = (blob) => {
        if (done) return;
        done = true;
        release();
        resolve(blob);
      };
      recorder.addEventListener('stop', () => finish(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })));
      // Si el navegador no avisa de que paro, no se espera para siempre.
      setTimeout(() => finish(chunks.length ? new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }) : null), 3000);
      try { recorder.stop(); } catch { finish(null); }
    }),
    cancel: () => {
      try { recorder.stop(); } catch { /* ya parado */ }
      release();
    },
  };
}
