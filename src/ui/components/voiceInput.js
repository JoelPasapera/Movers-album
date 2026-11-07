// @ts-check
// Contestar hablando, comun a los juegos de Speaking: el boton del
// microfono, el reconocimiento de voz (apagado por defecto, con su aviso), la
// grabacion que solo se oye en el aparato, y escribir como respaldo.
//
// Antes cada juego llevaba su copia y tenian fallos distintos: el aviso de
// privacidad salia oculto aunque el reconocimiento estuviera encendido, Tell
// the story reconocia la voz sin ensenar ningun aviso, y al salir de la
// pantalla grabando el microfono se quedaba abierto.

import { h, mount as fill } from '../../core/dom.js';
import { on } from '../../core/events.js';
import * as speech from '../../core/speech.js';

/** @typedef {'voice' | 'typed' | 'recorded'} How */

/**
 * @param {{
 *   placeholder: string,
 *   onAnswer: (text: string, how: How) => void,
 *   isBusy: () => boolean,
 *   doneLabel?: string,
 * }} options
 */
export function voiceInput({ placeholder, onAnswer, isBusy, doneLabel = 'I answered →' }) {
  const canRecognise = speech.recognitionSupported() && speech.secureEnough();
  const canRecord = speech.recorderSupported() && speech.secureEnough();

  /** @type {'idle' | 'starting' | 'live'} */
  let mode = 'idle';
  /** @type {((discard?: boolean) => void) | null} */
  let stopListening = null;
  /** @type {{ stop: () => Promise<Blob | null>, cancel: () => void } | null} */
  let recorder = null;
  /** @type {string | null} */
  let clipUrl = null;
  let alive = true;
  /** Cada vez que se empieza o se cancela una grabacion, cambia. */
  let attempt = 0;

  const heard = h('p', { class: 'talk-heard', 'aria-live': 'polite' });
  const status = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const clip = h('div', { class: 'talk-playback hidden' });
  const label = h('span', { class: 'mic__label' });
  const mic = h('button', { class: 'mic', type: 'button' }, [h('span', { class: 'mic__dot', 'aria-hidden': 'true' }), label]);
  const typed = /** @type {HTMLInputElement} */ (h('input', {
    type: 'text', maxlength: '120', autocomplete: 'off', placeholder, 'aria-label': placeholder,
  }));
  const send = h('button', { class: 'btn', type: 'button', onClick: () => submitTyped() }, 'Send');

  const toggle = h('button', {
    class: 'btn btn--ghost', type: 'button',
    onClick: () => speech.allowRecognition(!speech.isRecognitionAllowed()),
  });
  const privacy = h('p', { class: 'talk-privacy', role: 'status' },
    'Listening is on: your browser sends the sound of your voice to its speech service to turn it into words. '
    + 'Turn it off to keep everything on this device.');

  function paintSwitch() {
    const allowed = speech.isRecognitionAllowed();
    // Se apago mientras escuchaba: core/speech.js ya corto y tiro lo oido.
    if (!allowed && stopListening) {
      stopListening = null;
      heard.textContent = '';
      setMode('idle');
      if (alive) say('Listening is off now. Tap to talk again, or type your answer.');
    }
    toggle.setAttribute('aria-pressed', String(allowed));
    toggle.textContent = allowed ? 'Listening: on' : 'Listening: off';
    toggle.classList.toggle('hidden', !canRecognise);
    privacy.classList.toggle('hidden', !allowed);
  }
  const unsubscribe = on('speech:recognition', paintSwitch);

  /** @param {'idle' | 'starting' | 'live'} next */
  function setMode(next) {
    mode = next;
    mic.classList.toggle('is-live', next === 'live');
    const text = {
      idle: canRecognise || canRecord ? 'Tap to talk' : 'No microphone',
      starting: 'Wait…',
      live: 'Listening… tap to stop',
    }[next];
    label.textContent = text;
    mic.setAttribute('aria-label', text);
  }

  /** @param {string} message */
  const say = (message) => {
    status.textContent = message;
    status.className = 'spell-feedback spell-feedback--no';
  };

  function submitTyped() {
    if (isBusy()) return;
    const value = typed.value.trim();
    if (!value) {
      typed.focus();
      return;
    }
    onAnswer(value, 'typed');
  }
  typed.addEventListener('keydown', (/** @type {KeyboardEvent} */ e) => { if (e.key === 'Enter') submitTyped(); });

  function dropClip() {
    if (clipUrl) URL.revokeObjectURL(clipUrl);
    clipUrl = null;
    fill(clip);
    clip.classList.add('hidden');
  }

  async function start() {
    if (isBusy() || mode !== 'idle') return;
    if (!canRecognise && !canRecord) {
      say('This device has no microphone here. Say it out loud anyway, then type it.');
      typed.focus();
      return;
    }
    status.textContent = '';
    heard.textContent = '';
    dropClip();
    if (speech.isRecognitionAllowed() && canRecognise) {
      setMode('live');
      stopListening = speech.listen({
        onResult: ({ text }) => { heard.textContent = text; },
        onEnd: (text) => {
          stopListening = null;
          setMode('idle');
          if (alive && text) onAnswer(text, 'voice');
          else if (alive) say('I could not hear you. Try again or type it.');
        },
        onError: () => {
          stopListening = null;
          setMode('idle');
          if (alive) say('I could not hear you. Try again or type it.');
        },
      });
      return;
    }
    setMode('starting');
    attempt += 1;
    const mine = attempt;
    try {
      const pending = await speech.record();
      // Si mientras se pedia permiso el nino se fue o toco otra vez, se tira.
      if (!alive || mine !== attempt) {
        pending.cancel();
        return;
      }
      recorder = pending;
      setMode('live');
    } catch {
      setMode('idle');
      if (alive) say('The microphone is not allowed here. Type your answer instead.');
    }
  }

  async function stop() {
    if (mode === 'starting') {
      attempt += 1;
      setMode('idle');
      return;
    }
    if (mode !== 'live') return;
    setMode('idle');
    if (stopListening) {
      stopListening();
      return;
    }
    const current = recorder;
    recorder = null;
    if (!current) return;
    const blob = await current.stop();
    if (!alive || !blob) return;
    clipUrl = URL.createObjectURL(blob);
    fill(clip, [
      h('p', { class: 'talk-playback__hint' }, 'Listen to yourself, then compare:'),
      h('audio', { controls: 'controls', src: clipUrl }),
      h('button', {
        class: 'btn btn--go', type: 'button',
        onClick: () => !isBusy() && onAnswer(typed.value.trim() || '…spoken…', 'recorded'),
      }, doneLabel),
    ]);
    clip.classList.remove('hidden');
  }

  mic.addEventListener('click', () => (mode === 'idle' ? start() : stop()));

  /** Para la pregunta siguiente: limpia lo oido, lo escrito y la grabacion. */
  function reset() {
    attempt += 1;
    if (stopListening) { stopListening(true); stopListening = null; }
    if (recorder) { recorder.cancel(); recorder = null; }
    setMode('idle');
    heard.textContent = '';
    status.textContent = '';
    status.className = 'spell-feedback';
    typed.value = '';
    dropClip();
  }

  /** Al salir de la pantalla: nada se queda escuchando ni grabando. */
  function destroy() {
    alive = false;
    reset();
    unsubscribe();
  }

  /** Una frase que explica al nino como se va a oir su respuesta. */
  const describe = () => (speech.isRecognitionAllowed() && canRecognise
    ? 'Your answer is turned into words so it can be checked.'
    : canRecord
      ? 'Your voice is recorded on this device only, so you can hear yourself.'
      : 'No microphone here. Type your answers instead.');

  setMode('idle');
  paintSwitch();
  return { mic, heard, status, clip, typed, send, toggle, privacy, reset, destroy, describe };
}
