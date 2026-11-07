// @ts-check
// Avisos entre modulos que no se conocen: uno emite 'state:changed' y la
// barra, el album o el plan se repintan sin que el estado sepa que existen.

/** @typedef {(payload?: any) => void} Handler */

/** @type {Map<string, Set<Handler>>} */
const channels = new Map();

/**
 * Escucha un aviso. Devuelve la funcion que deja de escucharlo.
 * @param {string} name @param {Handler} handler
 * @returns {() => void}
 */
export function on(name, handler) {
  let set = channels.get(name);
  if (!set) {
    set = new Set();
    channels.set(name, set);
  }
  set.add(handler);
  return () => off(name, handler);
}

/** @param {string} name @param {Handler} handler */
export function off(name, handler) {
  channels.get(name)?.delete(handler);
}

/**
 * Avisa a todos los que escuchan. Si uno falla, los demas se enteran igual.
 * @param {string} name @param {any} [payload]
 */
export function emit(name, payload) {
  channels.get(name)?.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error(`[events] handler failed for "${name}"`, err);
    }
  });
}

/**
 * Cuantos escuchan un aviso. Sirve para comprobar que una pantalla no deja
 * oyentes colgados al irse.
 * @param {string} name
 */
export const listenerCount = (name) => channels.get(name)?.size ?? 0;

/**
 * Apunta quien escucha ahora y devuelve con que dejarlo todo como estaba:
 * lo que se haya puesto a escuchar despues deja de hacerlo. Sirve para
 * desmontar la app entera de una vez (lo usan las comprobaciones).
 * @returns {() => void}
 */
export function checkpoint() {
  const saved = new Map([...channels].map(([name, set]) => [name, new Set(set)]));
  return () => {
    channels.clear();
    for (const [name, set] of saved) channels.set(name, set);
  };
}
