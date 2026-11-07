// @ts-check
// El "navegador" completo de la comprobacion 17: documento, ventana, reloj de
// mentira (los setTimeout no esperan: avanzan cuando la prueba quiere), azar
// con semilla (para que un fallo se pueda repetir), almacenamiento, y una voz
// de sintesis falsa que tarda lo que tardaria una de verdad.
//
// install() lo pone todo en globalThis; uninstall() devuelve node a como
// estaba. Mientras esta instalado, los temporizadores reales no se usan.

import {
  FakeDocument, FakeElement, FakeEvent, FakeFileReader, FakeFragment, FakeNode, FakeStorage, FakeText,
  Target, strayErrors,
} from './dom.js';
import { checkpoint } from '../../src/core/events.js';

/** @typedef {import('./dom.js').DomError} DomError */

// ------------------------------------------------------------- reloj

export class FakeClock {
  /** @param {number} start */
  constructor(start) {
    this.now = start;
    this.nextId = 1;
    /** @type {Map<number, { at: number, fn: Function, args: any[], every: number }>} */
    this.timers = new Map();
    /** @type {DomError[]} */
    this.errors = [];
    this.fired = 0;
  }

  /** @param {Function} fn @param {number} [ms] @param {...any} args */
  setTimeout(fn, ms = 0, ...args) {
    const id = this.nextId++;
    this.timers.set(id, { at: this.now + Math.max(0, Number(ms) || 0), fn, args, every: 0 });
    return id;
  }

  /** @param {Function} fn @param {number} [ms] @param {...any} args */
  setInterval(fn, ms = 0, ...args) {
    const id = this.nextId++;
    const every = Math.max(1, Number(ms) || 0);
    this.timers.set(id, { at: this.now + every, fn, args, every });
    return id;
  }

  /** @param {any} id */
  clear(id) { this.timers.delete(Number(id)); }

  /** El siguiente temporizador que vence antes de `limit`, en orden. */
  /** @param {number} limit */
  due(limit) {
    let best = null;
    let bestId = 0;
    for (const [id, t] of this.timers) {
      if (t.at > limit) continue;
      if (!best || t.at < best.at || (t.at === best.at && id < bestId)) { best = t; bestId = id; }
    }
    return best ? { id: bestId, timer: best } : null;
  }

  /**
   * Avanza el reloj `ms` milisegundos ejecutando lo que venza por el camino.
   * @param {number} ms
   */
  advance(ms) {
    const end = this.now + Math.max(0, ms);
    let guard = 0;
    for (;;) {
      const next = this.due(end);
      if (!next) break;
      guard += 1;
      if (guard > 200000) {
        this.errors.push({ where: 'reloj', error: new Error('mas de 200000 temporizadores seguidos: hay un bucle') });
        this.timers.clear();
        break;
      }
      const { id, timer } = next;
      this.now = Math.max(this.now, timer.at);
      if (timer.every) timer.at += timer.every;
      else this.timers.delete(id);
      this.fired += 1;
      try {
        timer.fn(...timer.args);
      } catch (error) {
        this.errors.push({ where: 'temporizador', error });
      }
    }
    this.now = end;
  }
}

// ------------------------------------------------------------- azar con semilla

/** @param {number} seed */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------- voz falsa

class FakeUtterance extends Target {
  /** @param {string} [text] */
  constructor(text = '') {
    super();
    this.text = String(text);
    this.lang = '';
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    /** @type {any} */
    this.voice = null;
  }
}

/**
 * Sintesis de voz que tarda lo que tardaria una real (unos 14 caracteres por
 * segundo a velocidad 1) y que, como Chrome, avisa con un error "interrupted"
 * cuando se corta lo que estaba sonando.
 */
class FakeSpeech extends Target {
  /** @param {FakeClock} clock @param {DomError[]} sink */
  constructor(clock, sink) {
    super();
    this.clock = clock;
    this.sink = sink;
    /** @type {FakeUtterance[]} */
    this.queue = [];
    /** @type {FakeUtterance | null} */
    this.current = null;
    this.timer = 0;
    this.speaking = false;
    this.pending = false;
    this.paused = false;
    /** @type {{ text: string, rate: number, pitch: number, voice: string, lang: string }[]} */
    this.spoken = [];
    /** Simula el fallo de Chrome: la frase suena pero 'end' no llega nunca. */
    this.dropEnds = false;
    this.voices = [
      { name: 'Fake British', lang: 'en-GB', default: true, localService: true, voiceURI: 'fake-gb' },
      { name: 'Fake American', lang: 'en-US', default: false, localService: true, voiceURI: 'fake-us' },
      { name: 'Fake Spanish', lang: 'es-ES', default: false, localService: true, voiceURI: 'fake-es' },
    ];
  }

  getVoices() { return this.voices; }

  /** @param {FakeUtterance} u */
  speak(u) {
    this.queue.push(u);
    this.pending = true;
    if (!this.current) this.next();
  }

  next() {
    const u = this.queue.shift();
    this.current = u ?? null;
    this.speaking = Boolean(u);
    this.pending = this.queue.length > 0;
    if (!u) return;
    this.spoken.push({ text: u.text, rate: u.rate, pitch: u.pitch, voice: u.voice?.voiceURI ?? '', lang: u.lang });
    const ms = Math.max(300, (u.text.length / 14) * 1000 / (u.rate || 1));
    u.fire(new FakeEvent('start'), this.sink);
    this.timer = this.clock.setTimeout(() => {
      this.current = null;
      if (!this.dropEnds) u.fire(new FakeEvent('end'), this.sink);
      this.next();
    }, ms);
  }

  cancel() {
    const cut = [this.current, ...this.queue].filter(Boolean);
    this.clock.clear(this.timer);
    this.current = null;
    this.queue = [];
    this.speaking = false;
    this.pending = false;
    for (const u of cut) {
      const event = new FakeEvent('error');
      /** @type {any} */ (event).error = 'interrupted';
      /** @type {FakeUtterance} */ (u).fire(event, this.sink);
    }
  }

  pause() { this.paused = true; }
  resume() { this.paused = false; }
}

// ------------------------------------------------------------- microfono

/**
 * getUserMedia y MediaRecorder de mentira. `live` cuenta las pistas de audio
 * abiertas: si al salir de una pantalla queda alguna, el microfono se quedo
 * encendido (el piloto rojo del navegador seguiria ahi).
 */
class FakeMedia {
  /** @param {FakeClock} clock @param {DomError[]} sink */
  constructor(clock, sink) {
    this.clock = clock;
    this.sink = sink;
    this.live = 0;
    this.opened = 0;
    /** Lo que tarda el permiso (el nino tarda en pulsar "Permitir"). */
    this.delay = 0;
    this.deny = false;
    const media = this;
    this.mediaDevices = {
      getUserMedia: () => new Promise((resolve, reject) => {
        const open = () => {
          if (media.deny) { reject(new Error('NotAllowedError')); return; }
          media.live += 1;
          media.opened += 1;
          let stopped = false;
          const track = { kind: 'audio', stop: () => { if (!stopped) { stopped = true; media.live -= 1; } } };
          resolve({ getTracks: () => [track], getAudioTracks: () => [track] });
        };
        if (media.delay) clock.setTimeout(open, media.delay);
        else open();
      }),
    };
    this.MediaRecorder = class extends Target {
      /** @param {any} stream */
      constructor(stream) {
        super();
        this.stream = stream;
        this.state = 'inactive';
        this.mimeType = 'audio/webm';
      }
      start() { this.state = 'recording'; }
      stop() {
        if (this.state === 'inactive') throw new Error('InvalidStateError');
        this.state = 'inactive';
        clock.setTimeout(() => {
          const data = new FakeEvent('dataavailable');
          /** @type {any} */ (data).data = new Blob(['fake audio'], { type: 'audio/webm' });
          this.fire(data, sink);
          this.fire(new FakeEvent('stop'), sink);
        }, 20);
      }
    };
  }
}

/** Reconocimiento de voz de mentira: "oye" lo que diga `next`. */
function fakeRecognition(/** @type {FakeClock} */ clock, /** @type {DomError[]} */ sink, /** @type {{ next: string, started: number }} */ script) {
  return class extends Target {
    constructor() {
      super();
      this.lang = '';
      this.interimResults = false;
      this.maxAlternatives = 1;
      this.continuous = false;
      this.running = false;
    }
    start() {
      this.running = true;
      script.started += 1;
      clock.setTimeout(() => {
        if (!this.running) return;
        const event = new FakeEvent('result');
        const result = Object.assign([{ transcript: script.next }], { isFinal: true });
        Object.assign(event, { resultIndex: 0, results: [result] });
        this.fire(event, sink);
        this.running = false;
        this.fire(new FakeEvent('end'), sink);
      }, 1500);
    }
    stop() {
      if (!this.running) return;
      this.running = false;
      this.fire(new FakeEvent('end'), sink);
    }
    // Como en Chrome: abortar no entrega lo oido; avisa con error 'aborted' y termina.
    abort() {
      if (!this.running) return;
      this.running = false;
      this.fire(Object.assign(new FakeEvent('error'), { error: 'aborted' }), sink);
      this.fire(new FakeEvent('end'), sink);
    }
  };
}

// ------------------------------------------------------------- ventana

class FakeLocation {
  /** @param {FakeWindow} win */
  constructor(win) {
    this.win = win;
    this.hashValue = '';
    this.protocol = 'http:';
    this.hostname = 'localhost';
    this.host = 'localhost:8000';
    this.port = '8000';
    this.origin = 'http://localhost:8000';
    this.pathname = '/index.html';
    this.search = '';
  }
  get href() { return `${this.origin}${this.pathname}${this.search}${this.hashValue}`; }
  get hash() { return this.hashValue; }
  set hash(value) {
    const next = String(value).startsWith('#') ? String(value) : `#${value}`;
    if (next === this.hashValue) return;
    this.hashValue = next;
    // Como en un navegador, hashchange llega despues, no en el acto.
    this.win.clock.setTimeout(() => this.win.dispatchEvent(new FakeEvent('hashchange')), 0);
  }
  reload() { this.win.reloads += 1; }
  /** @param {string} url */
  assign(url) { this.hash = String(url).replace(/^[^#]*/, ''); }
  /** @param {string} url */
  replace(url) { this.assign(url); }
}

export class FakeWindow extends Target {
  /** @param {FakeDocument} document @param {FakeClock} clock */
  constructor(document, clock) {
    super();
    this.document = document;
    this.clock = clock;
    this.location = new FakeLocation(this);
    this.localStorage = new FakeStorage();
    this.sessionStorage = new FakeStorage();
    this.innerWidth = 1100;
    this.innerHeight = 900;
    this.devicePixelRatio = 1;
    this.isSecureContext = true;
    this.printed = 0;
    this.reloads = 0;
    this.confirmAnswer = true;
    /** @type {string[]} */
    this.dialogs = [];
    this.navigator = {
      language: 'en-GB', languages: ['en-GB', 'en'], userAgent: 'node-fake-browser', onLine: true,
      mediaDevices: undefined, serviceWorker: undefined, maxTouchPoints: 0,
    };
    this.history = { length: 1, state: null, pushState() {}, replaceState() {}, back() {} };
    this.performance = { now: () => clock.now };
    /** @type {Map<string, Blob>} */
    this.blobs = new Map();
  }

  dispatchEvent(/** @type {FakeEvent} */ event) {
    event.target = this;
    this.fire(event, this.document.errors);
    return !event.defaultPrevented;
  }

  print() { this.printed += 1; }
  /** @param {string} m */
  alert(m) { this.dialogs.push(`alert: ${m}`); }
  /** @param {string} m */
  confirm(m) { this.dialogs.push(`confirm: ${m}`); return this.confirmAnswer; }
  /** @param {string} m */
  prompt(m) { this.dialogs.push(`prompt: ${m}`); return null; }
  /** @param {string} q */
  matchMedia(q) {
    return { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
  }
  /** @param {any} el */
  getComputedStyle(el) { return el?.style ?? {}; }
  scrollTo() {}
  scrollBy() {}
  focus() {}
  /** @param {(t: number) => void} fn */
  requestAnimationFrame(fn) { return this.clock.setTimeout(() => fn(this.clock.now), 16); }
  /** @param {number} id */
  cancelAnimationFrame(id) { this.clock.clear(id); }
}

// ------------------------------------------------------------- audio grabado

/**
 * Un <audio> de mentira para las grabaciones del profesor (core/recordings.js).
 * Suena lo que dure su blob (un milisegundo por cada 4 bytes, entre 0,3 y 20
 * segundos, mas lento si playbackRate baja), avisa con 'ended', y con 'error'
 * si el blob no existe o es de tipo 'audio/broken' (una grabacion rota).
 * `played` apunta cada vez que empieza a sonar algo.
 * @param {FakeClock} clock @param {FakeWindow} win @param {DomError[]} sink
 */
function fakeAudio(clock, win, sink) {
  /** @type {{ src: string, rate: number }[]} */
  const played = [];
  class FakeAudio extends Target {
    /** @param {string} [src] */
    constructor(src = '') {
      super();
      this.src = src;
      this.playbackRate = 1;
      this.paused = true;
      /** @type {any} */
      this.timer = null;
    }

    play() {
      const blob = /** @type {any} */ (win).blobs.get(this.src);
      this.paused = false;
      if (!blob || blob.type === 'audio/broken') {
        clock.setTimeout(() => this.fire(new FakeEvent('error'), sink), 0);
        return Promise.resolve();
      }
      played.push({ src: this.src, rate: this.playbackRate });
      const ms = Math.min(20000, Math.max(300, blob.size / 4)) / this.playbackRate;
      this.timer = clock.setTimeout(() => {
        this.paused = true;
        this.fire(new FakeEvent('ended'), sink);
      }, ms);
      return Promise.resolve();
    }

    pause() {
      this.paused = true;
      if (this.timer) clock.clear(this.timer);
      this.timer = null;
    }
  }
  return { FakeAudio, played };
}

// ------------------------------------------------------------- el conjunto

const GLOBALS = [
  'window', 'document', 'navigator', 'location', 'localStorage', 'sessionStorage', 'history',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame', 'cancelAnimationFrame',
  'Node', 'Element', 'HTMLElement', 'SVGElement', 'HTMLInputElement', 'Text', 'DocumentFragment',
  'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'FileReader', 'SpeechSynthesisUtterance', 'speechSynthesis',
  'getComputedStyle', 'matchMedia', 'confirm', 'alert', 'prompt', 'print', 'self', 'Audio',
];

/**
 * @param {{ seed?: number, start?: number, speech?: boolean, media?: boolean, recognition?: boolean }} [options]
 */
export function createBrowser({
  seed = 20261016, start = Date.UTC(2026, 9, 16, 15, 0, 0), speech = false, media = false, recognition = false,
} = {}) {
  const clock = new FakeClock(start);
  const document = new FakeDocument();
  const window = new FakeWindow(document, clock);
  document.defaultView = window;
  // Sin voz, la propiedad no existe (no vale con ponerla a undefined: la app
  // pregunta 'speechSynthesis' in window, como hay que preguntar).
  if (speech) /** @type {any} */ (window).speechSynthesis = new FakeSpeech(clock, document.errors);
  const mic = media ? new FakeMedia(clock, document.errors) : null;
  if (mic) {
    /** @type {any} */ (window.navigator).mediaDevices = mic.mediaDevices;
    /** @type {any} */ (window).MediaRecorder = mic.MediaRecorder;
  }
  const heard = { next: 'I like playing football with my friends', started: 0 };
  if (recognition) /** @type {any} */ (window).webkitSpeechRecognition = fakeRecognition(clock, document.errors, heard);
  const random = seededRandom(seed);
  const sound = fakeAudio(clock, window, document.errors);

  /** @type {Map<string, PropertyDescriptor | undefined>} */
  const saved = new Map();
  let savedNow = Date.now;
  let savedRandom = Math.random;
  let savedCreate = URL.createObjectURL;
  let savedRevoke = URL.revokeObjectURL;
  /** Deja los avisos (core/events.js) como estaban antes de instalar. */
  let restoreEvents = () => {};
  let blobCount = 0;
  /** @type {(reason: unknown) => void} */
  const onRejection = (reason) => { document.errors.push({ where: 'promesa rechazada sin capturar', error: reason }); };

  const values = {
    window, document, navigator: window.navigator, location: window.location,
    localStorage: window.localStorage, sessionStorage: window.sessionStorage, history: window.history,
    setTimeout: (/** @type {Function} */ fn, /** @type {number} */ ms, /** @type {any[]} */ ...args) => clock.setTimeout(fn, ms, ...args),
    clearTimeout: (/** @type {any} */ id) => clock.clear(id),
    setInterval: (/** @type {Function} */ fn, /** @type {number} */ ms, /** @type {any[]} */ ...args) => clock.setInterval(fn, ms, ...args),
    clearInterval: (/** @type {any} */ id) => clock.clear(id),
    requestAnimationFrame: (/** @type {any} */ fn) => window.requestAnimationFrame(fn),
    cancelAnimationFrame: (/** @type {any} */ id) => window.cancelAnimationFrame(id),
    Node: FakeNode, Element: FakeElement, HTMLElement: FakeElement, SVGElement: FakeElement, HTMLInputElement: FakeElement,
    Text: FakeText, DocumentFragment: FakeFragment,
    Event: FakeEvent, CustomEvent: FakeEvent, KeyboardEvent: FakeEvent, MouseEvent: FakeEvent,
    FileReader: FakeFileReader,
    SpeechSynthesisUtterance: speech ? FakeUtterance : undefined,
    speechSynthesis: /** @type {any} */ (window).speechSynthesis,
    getComputedStyle: (/** @type {any} */ el) => window.getComputedStyle(el),
    matchMedia: (/** @type {string} */ q) => window.matchMedia(q),
    confirm: (/** @type {string} */ m) => window.confirm(m),
    alert: (/** @type {string} */ m) => window.alert(m),
    prompt: (/** @type {string} */ m) => window.prompt(m),
    print: () => window.print(),
    self: window,
    Audio: sound.FakeAudio,
  };

  // Lo que el codigo de la app busca en `window.` tambien tiene que estar ahi.
  Object.assign(window, {
    setTimeout: values.setTimeout, clearTimeout: values.clearTimeout,
    setInterval: values.setInterval, clearInterval: values.clearInterval,
    Node: FakeNode, Element: FakeElement, HTMLElement: FakeElement,
    Event: FakeEvent, CustomEvent: FakeEvent, KeyboardEvent: FakeEvent, FileReader: FakeFileReader,
    URL, Blob, crypto: globalThis.crypto, Audio: sound.FakeAudio,
  });
  if (speech) /** @type {any} */ (window).SpeechSynthesisUtterance = FakeUtterance;

  const absent = new Set(speech ? [] : ['speechSynthesis', 'SpeechSynthesisUtterance']);

  function install() {
    for (const key of GLOBALS) {
      if (absent.has(key)) continue;
      saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { value: /** @type {any} */ (values)[key], configurable: true, writable: true, enumerable: false });
    }
    savedNow = Date.now;
    savedRandom = Math.random;
    savedCreate = URL.createObjectURL;
    savedRevoke = URL.revokeObjectURL;
    Date.now = () => clock.now;
    Math.random = random;
    URL.createObjectURL = (/** @type {Blob} */ blob) => {
      blobCount += 1;
      const url = `blob:fake/${blobCount}`;
      window.blobs.set(url, blob);
      return url;
    };
    URL.revokeObjectURL = (/** @type {string} */ url) => { window.blobs.delete(url); };
    process.on('unhandledRejection', onRejection);
    // Lo que la app ponga a escuchar mientras tanto (la barra, main.js, una
    // pantalla) se quita al desinstalar: no queda nada escuchando sin pantalla.
    restoreEvents = checkpoint();
  }

  function uninstall() {
    for (const [key, desc] of saved) {
      if (desc) Object.defineProperty(globalThis, key, desc);
      else delete (/** @type {any} */ (globalThis))[key];
    }
    saved.clear();
    Date.now = savedNow;
    Math.random = savedRandom;
    URL.createObjectURL = savedCreate;
    URL.revokeObjectURL = savedRevoke;
    process.off('unhandledRejection', onRejection);
    clock.timers.clear();
    restoreEvents();
    restoreEvents = () => {};
  }

  /** Todos los errores vistos: manejadores, temporizadores, promesas. */
  const errors = () => [...document.errors, ...clock.errors, ...strayErrors];

  return { window, document, clock, install, uninstall, errors, random, mic, heard, played: sound.played };
}

/** Deja correr las promesas pendientes (las importaciones dinamicas, async). */
export async function settle(rounds = 6) {
  for (let i = 0; i < rounds; i += 1) await new Promise((resolve) => setImmediate(resolve));
}
