// Entrada de voz. Hay dos caminos y son muy distintos en privacidad:
//
// 1. GRABAR (MediaRecorder). El audio no sale nunca del aparato. Sirve para que
//    el niño se escuche a sí mismo. Funciona en todos los navegadores modernos.
//
// 2. RECONOCER (SpeechRecognition). Chrome y Edge envían el audio a servidores
//    de Google para transcribirlo. Es voz de menores saliendo del dispositivo,
//    así que va APAGADO por defecto y hay que encenderlo a mano.
//
// Las dos cosas necesitan https o localhost. Con `npx serve` funciona.

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

let recognitionAllowed = false;

export const recognitionSupported = () => Boolean(Recognition);

export const recorderSupported = () => Boolean(
  window.MediaRecorder && navigator.mediaDevices?.getUserMedia,
);

export const secureEnough = () => window.isSecureContext
  || ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const isRecognitionAllowed = () => recognitionAllowed;

export function allowRecognition(value) {
  recognitionAllowed = Boolean(value) && recognitionSupported();
  return recognitionAllowed;
}

// Escucha una respuesta y devuelve el texto. La funcion que devuelve corta.
export function listen({ onResult, onEnd, onError, lang = 'en-GB' } = {}) {
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
  engine.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += chunk;
      else interim += chunk;
    }
    onResult?.({ text: `${finalText} ${interim}`.trim(), final: Boolean(finalText) });
  });
  engine.addEventListener('error', (event) => onError?.(event.error));
  engine.addEventListener('end', () => onEnd?.(finalText.trim()));

  try {
    engine.start();
  } catch {
    onError?.('start-failed');
  }
  return () => {
    try { engine.stop(); } catch { /* ya parado */ }
  };
}

// Graba y devuelve un blob local. No sube nada a ninguna parte.
export async function record() {
  if (!recorderSupported()) throw new Error('unsupported');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks = [];
  const recorder = new MediaRecorder(stream);
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size) chunks.push(event.data);
  });
  recorder.start();

  return {
    stop: () => new Promise((resolve) => {
      recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((track) => track.stop());
        resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      });
      try { recorder.stop(); } catch { resolve(null); }
    }),
  };
}
