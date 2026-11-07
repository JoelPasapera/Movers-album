// @ts-check
// La voz es la mitad del examen (Listening entero y las instrucciones de
// Speaking). Esta comprobacion usa una voz de mentira que tarda lo que una de
// verdad y verifica que los dialogos suenan enteros, en orden, sin mezclarse
// al repetirlos, que no se cuelgan si el navegador pierde un aviso, y que el
// simulacro habla a la velocidad del examen aunque en practica se elija lenta.

import { createBrowser, settle } from './lib/browser.js';

export const name = 'La voz dice los dialogos enteros y no se cuelga';

export async function run() {
  /** @type {string[]} */
  const problems = [];
  const browser = createBrowser({ speech: true, seed: 3 });
  browser.install();
  const { clock } = browser;
  const synth = /** @type {any} */ (browser.window).speechSynthesis;
  const said = () => synth.spoken.map((/** @type {any} */ u) => u.text);
  const reset = () => { synth.spoken.length = 0; };
  let checks = 0;

  try {
    const audio = await import('../src/core/audio.js');
    const settings = await import('../src/core/settings.js');
    audio.initVoice();
    audio.setMuted(false);
    audio.setExamMode(false);
    settings.setSetting('speed', 'normal');
    settings.setSetting('voiceURI', '');

    const lines = [
      { who: 'adult', text: 'Hello, Jim. What did you do on Saturday?' },
      { who: 'child', text: 'I went to the park with my sister.' },
      { who: 'adult', text: 'Did you play football there?' },
      { who: 'child', text: 'No, we played tennis.' },
    ];

    // 1. Un dialogo suena entero, en orden, con dos tonos y avisa al final
    reset();
    let ended = 0;
    audio.speakLines(lines, { onEnd: () => { ended += 1; } });
    clock.advance(60000);
    checks += 1;
    if (said().join('|') !== lines.map((l) => l.text).join('|')) problems.push(`el dialogo no suena entero y en orden: ${said().join(' / ')}`);
    if (ended !== 1) problems.push(`el final del dialogo se avisa ${ended} veces`);
    const pitches = new Set(synth.spoken.map((/** @type {any} */ u) => u.pitch));
    if (pitches.size !== 2) problems.push('el adulto y el nino suenan con el mismo tono');

    // 2. Repetir a mitad: el primero se corta y no se mezcla con el segundo
    reset();
    let firstEnded = 0;
    let secondEnded = 0;
    audio.speakLines(lines, { onEnd: () => { firstEnded += 1; } });
    clock.advance(3500);
    const heardBefore = said().length;
    audio.speakLines(lines, { onEnd: () => { secondEnded += 1; } });
    clock.advance(60000);
    checks += 1;
    const after = said().slice(heardBefore);
    if (after.join('|') !== lines.map((l) => l.text).join('|')) problems.push(`al repetir, el dialogo se mezcla con el anterior: ${after.join(' / ')}`);
    if (firstEnded !== 0) problems.push('el dialogo cortado avisa de que termino');
    if (secondEnded !== 1) problems.push('el dialogo repetido no avisa al terminar');

    // 3. Si el navegador pierde el aviso de fin, el dialogo sigue igual
    reset();
    synth.dropEnds = true;
    let rescued = 0;
    audio.speakLines(lines, { onEnd: () => { rescued += 1; } });
    clock.advance(120000);
    synth.dropEnds = false;
    checks += 1;
    if (said().length !== lines.length || rescued !== 1) problems.push(`sin el aviso de fin, el dialogo se queda en la linea ${said().length} de ${lines.length}`);

    // 4. Un texto largo se dice frase a frase, entero
    reset();
    const long = 'This is the toy shop in the village. The children want to buy their favourite toys. '
      + 'There are fat teddy bears, funny comic books and a parrot in a cage. The parrot can say hello. '
      + 'A tall clown sells balloons at the door, and everyone laughs at his big red shoes.';
    let longEnded = 0;
    audio.speak(long, { onEnd: () => { longEnded += 1; } });
    clock.advance(60000);
    checks += 1;
    if (said().some((t) => t.length > 160)) problems.push('un texto largo se dice de una vez y Chrome lo corta a los quince segundos');
    if (said().join(' ') !== long.replace(/\s+/g, ' ').trim()) problems.push('un texto largo no se dice entero');
    if (longEnded !== 1) problems.push('un texto largo no avisa al terminar');

    // 5. stop() corta sin avisar; con el sonido apagado no suena nada
    reset();
    let stopped = 0;
    audio.speak('One, two, three, four, five.', { onEnd: () => { stopped += 1; } });
    clock.advance(200);
    audio.stop();
    clock.advance(10000);
    checks += 1;
    if (stopped !== 0) problems.push('una frase cortada con stop() avisa de que termino');
    reset();
    audio.setMuted(true);
    let mutedEnd = 0;
    audio.speak('You cannot hear me.', { onEnd: () => { mutedEnd += 1; } });
    clock.advance(10000);
    audio.setMuted(false);
    checks += 1;
    if (said().length) problems.push('con el sonido apagado sigue hablando');
    if (mutedEnd !== 1) problems.push('con el sonido apagado, quien espera el final se queda esperando');

    // 6. Velocidad: lenta en practica si se elige, la del examen en el simulacro
    reset();
    audio.setSpeed('slow');
    audio.speak('Slow, please.');
    clock.advance(10000);
    audio.setExamMode(true);
    audio.speak('Exam speed.');
    clock.advance(10000);
    audio.setExamMode(false);
    audio.setSpeed('normal');
    checks += 1;
    const [slow, exam] = synth.spoken;
    if (!slow || slow.rate !== audio.RATES.slow) problems.push('la velocidad lenta no se aplica en la practica');
    if (!exam || exam.rate !== audio.EXAM_RATE) problems.push('en el simulacro no se habla a la velocidad del examen');

    // 7. La voz elegida se usa, y si desaparece se vuelve a una inglesa
    reset();
    const voices = audio.englishVoices();
    if (voices.some((v) => !v.lang.toLowerCase().startsWith('en'))) problems.push('la lista de voces ofrece una voz que no es inglesa');
    const us = voices.find((v) => v.lang === 'en-US');
    if (us) audio.setVoice(us.uri);
    audio.speak('Which voice?');
    clock.advance(10000);
    settings.setSetting('voiceURI', 'no-such-voice');
    audio.initVoice();
    audio.speak('And now?');
    clock.advance(10000);
    settings.setSetting('voiceURI', '');
    audio.initVoice();
    checks += 1;
    if (synth.spoken[0]?.voice !== us?.uri) problems.push('la voz elegida en Ajustes no se usa');
    if (!['fake-gb', 'fake-us'].includes(synth.spoken[1]?.voice)) problems.push('si la voz elegida desaparece, no se vuelve a una inglesa');

    // 8. La voz del profesor (core/recordings.js): una frase grabada suena con
    // su grabacion, en su sitio dentro de un dialogo y a la velocidad que toca;
    // cortada no avisa; rota, se dice con la voz del navegador; sin sonido, nada;
    // y lo que no esta grabado sigue con la voz del navegador.
    problems.push(...await teacherVoice(audio, browser, clock, lines, said, reset));
    checks += 1;

    for (const e of browser.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
  } catch (error) {
    problems.push(`la comprobacion se rompio: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    browser.uninstall();
  }

  const privacy = await privacyChecks();
  problems.push(...privacy.problems);
  checks += privacy.checks;

  return {
    ok: problems.length === 0,
    detail: `${checks} situaciones de voz y microfono probadas`,
    problems,
  };
}

/**
 * Microfono y reconocimiento de voz: son menores. El reconocimiento empieza
 * apagado; si se enciende, el aviso se ve en el juego y en la barra; al salir
 * de una pantalla el microfono se apaga; y una grabacion no se queda colgada.
 */
async function privacyChecks() {
  /** @type {string[]} */
  const problems = [];
  let checks = 0;
  const browser = createBrowser({ media: true, recognition: true, seed: 11 });
  browser.install();
  const { clock, document } = browser;
  const mic = /** @type {NonNullable<typeof browser.mic>} */ (browser.mic);
  const visible = (/** @type {any} */ el) => {
    let n = el;
    while (n && n.classList) { if (n.classList.contains('hidden')) return false; n = n.parentNode; }
    return Boolean(el);
  };
  /** @param {any} root @param {RegExp} re */
  const button = (root, re) => root.querySelectorAll('button').find((/** @type {any} */ b) => re.test(b.textContent.trim()));
  try {
    const speech = await import('../src/core/speech.js');
    const { renderShell } = await import('../src/ui/shell.js');
    const talk = await import('../src/games/talkabout/index.js');
    const story = await import('../src/games/story/index.js');
    speech.allowRecognition(false);

    const shell = document.createElement('div');
    document.body.append(shell);
    renderShell(shell);
    const shellNotice = shell.querySelector('.voice-notice--listening');

    // 1. Empieza apagado, sin aviso en la barra
    checks += 1;
    if (speech.isRecognitionAllowed()) problems.push('el reconocimiento de voz empieza encendido');
    if (visible(shellNotice)) problems.push('la barra avisa de reconocimiento encendido estando apagado');

    // 2. Encenderlo en Talk about you: aviso en el juego, en la barra y en Tell the story
    const a = document.createElement('div');
    document.body.append(a);
    const talkGame = talk.mount(a, { topicId: 'animals', onExit() {} });
    clock.advance(500);
    checks += 1;
    if (visible(a.querySelector('.talk-privacy'))) problems.push('Talk about you ensena el aviso de privacidad con el reconocimiento apagado');
    button(a, /^Listening: off$/)?.click();
    if (!speech.isRecognitionAllowed()) problems.push('el interruptor de Talk about you no enciende el reconocimiento');
    if (!visible(a.querySelector('.talk-privacy'))) problems.push('con el reconocimiento encendido, Talk about you no ensena el aviso');
    if (!visible(shellNotice)) problems.push('con el reconocimiento encendido, la barra no lo avisa');
    const b = document.createElement('div');
    document.body.append(b);
    const storyGame = story.mount(b, { onExit() {} });
    clock.advance(500);
    button(b, /I am ready/)?.click();
    clock.advance(500);
    checks += 1;
    if (!visible(b.querySelector('.talk-privacy'))) problems.push('Tell the story reconoce la voz sin ensenar el aviso de privacidad');

    // 3. Con reconocimiento: se habla y la respuesta se corrige
    browser.heard.next = 'I like playing football with my friends';
    const talkMic = a.querySelector('.mic');
    talkMic?.click();
    clock.advance(3000);
    checks += 1;
    if (browser.heard.started < 1) problems.push('con el reconocimiento encendido, el microfono no escucha');
    if (!/football/.test(a.querySelector('.talk-heard')?.textContent ?? '')) problems.push('lo que se oye no aparece en pantalla');
    if (!/\S/.test(a.querySelector('.talk-model')?.textContent ?? '')) problems.push('una respuesta hablada no se corrige');

    // 4. Apagarlo desde la barra lo apaga en todas partes
    button(shell, /Turn it off/)?.click();
    checks += 1;
    if (speech.isRecognitionAllowed()) problems.push('el boton de la barra no apaga el reconocimiento');
    if (visible(shellNotice) || visible(a.querySelector('.talk-privacy')) || visible(b.querySelector('.talk-privacy'))) {
      problems.push('al apagar el reconocimiento queda algun aviso encendido');
    }
    talkGame.destroy();
    storyGame.destroy();
    a.remove();
    b.remove();

    // 4b. Apagarlo MIENTRAS escucha: se corta y lo oido se tira (no se corrige)
    speech.allowRecognition(true);
    const e = document.createElement('div');
    document.body.append(e);
    const g0 = talk.mount(e, { topicId: 'animals', onExit() {} });
    clock.advance(500);
    browser.heard.next = 'I like playing football with my friends';
    e.querySelector('.mic')?.click();
    clock.advance(500);
    button(shell, /Turn it off/)?.click();
    clock.advance(3000);
    checks += 1;
    if (/football/.test(e.querySelector('.talk-heard')?.textContent ?? '')) problems.push('al apagar el reconocimiento mientras escucha, lo oido sigue llegando');
    if (/\S/.test(e.querySelector('.talk-model')?.textContent ?? '')) problems.push('al apagar el reconocimiento mientras escucha, la respuesta se corrige igual');
    if (!/Tap to talk/.test(e.querySelector('.mic')?.textContent ?? '')) problems.push('al apagar el reconocimiento mientras escucha, el microfono sigue diciendo que escucha');
    g0.destroy();
    e.remove();

    // 5. Grabar y salir de la pantalla: el microfono se apaga
    const c = document.createElement('div');
    document.body.append(c);
    const g1 = talk.mount(c, { topicId: 'animals', onExit() {} });
    clock.advance(500);
    c.querySelector('.mic')?.click();
    await new Promise((r) => setImmediate(r));
    clock.advance(100);
    checks += 1;
    if (mic.live !== 1) problems.push(`al tocar el microfono no se graba (pistas abiertas: ${mic.live})`);
    g1.destroy();
    clock.advance(1000);
    if (mic.live !== 0) problems.push('al salir de Talk about you grabando, el microfono se queda encendido');
    c.remove();

    // 6. Tocar dos veces mientras se pide permiso: no queda una grabacion huerfana
    const d = document.createElement('div');
    document.body.append(d);
    const g2 = talk.mount(d, { topicId: 'animals', onExit() {} });
    clock.advance(500);
    mic.delay = 3000;
    const m = d.querySelector('.mic');
    m?.click();
    clock.advance(500);
    m?.click();
    clock.advance(4000);
    for (let i = 0; i < 4; i += 1) await new Promise((r) => setImmediate(r));
    checks += 1;
    if (mic.live !== 0) problems.push('si se toca el microfono dos veces mientras pide permiso, queda grabando a escondidas');
    if (!/Tap to talk/.test(m?.textContent ?? '')) problems.push(`tras cancelar, el boton del microfono dice "${m?.textContent}"`);
    mic.delay = 0;

    // 7. Grabar, parar y pasar de pregunta: la grabacion se oye y luego se libera
    m?.click();
    for (let i = 0; i < 3; i += 1) await new Promise((r) => setImmediate(r));
    clock.advance(1000);
    m?.click();
    clock.advance(100);
    for (let i = 0; i < 4; i += 1) await new Promise((r) => setImmediate(r));
    const audioUrl = d.querySelector('.talk-playback audio')?.getAttribute('src') ?? '';
    checks += 1;
    if (!audioUrl.startsWith('blob:')) problems.push('despues de grabar no se puede escuchar la grabacion');
    if (mic.live !== 0) problems.push('despues de parar de grabar, el microfono sigue encendido');
    button(d, /I answered/)?.click();
    button(d, /Next question/)?.click();
    clock.advance(500);
    if (audioUrl && browser.window.blobs.has(audioUrl)) problems.push('la grabacion de la pregunta anterior se queda en memoria');
    g2.destroy();
    d.remove();

    for (const e of browser.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
  } catch (error) {
    problems.push(`la prueba de privacidad se rompio: ${error instanceof Error ? error.stack : String(error)}`);
  } finally {
    browser.uninstall();
  }
  return { problems, checks };
}

/**
 * La voz del profesor: grabaciones en lugar de la voz del navegador, y el
 * archivo para pasarlas a otras tablets.
 * @param {any} audio @param {any} browser @param {any} clock @param {{ who: string, text: string }[]} lines
 * @param {() => string[]} said @param {() => void} reset
 */
async function teacherVoice(audio, browser, clock, lines, said, reset) {
  /** @type {string[]} */
  const problems = [];
  const recordings = await import('../src/core/recordings.js');
  recordings.resetForTests();
  const clip = (n = 4000, type = 'audio/webm') => new Blob([new Uint8Array(n).fill(7)], { type });
  const run = async (/** @type {number} */ seconds) => {
    for (let i = 0; i < seconds; i += 1) { await settle(2); clock.advance(1000); }
  };
  const played = browser.played;
  await recordings.save(lines[0].text, clip());
  await recordings.save('A broken one.', clip(4000, 'audio/broken'));
  await recordings.save('Let\u2019s go to the zoo.', clip());

  reset(); played.length = 0;
  let ended = 0;
  audio.speakLines(lines, { onEnd: () => { ended += 1; } });
  await run(60);
  if (played.length !== 1) problems.push(`la frase grabada no suena con la voz del profesor (${played.length} grabaciones)`);
  if (said().join('|') !== lines.slice(1).map((l) => l.text).join('|')) problems.push(`con una frase grabada, el dialogo no sigue en orden: ${said().join(' / ')}`);
  if (ended !== 1) problems.push('con una frase grabada, el dialogo no avisa al terminar');

  reset(); played.length = 0;
  let cut = 0;
  audio.speak(lines[0].text, { onEnd: () => { cut += 1; } });
  await settle(3);
  clock.advance(300);
  audio.stop();
  await run(10);
  if (cut !== 0) problems.push('una grabacion cortada con stop() avisa de que termino');

  reset();
  let broken = 0;
  audio.speak('A broken one.', { onEnd: () => { broken += 1; } });
  await run(20);
  if (said().join('|') !== 'A broken one.' || broken !== 1) problems.push('una grabacion rota no se dice con la voz del navegador');

  played.length = 0;
  audio.speak("Let's go to the zoo.");
  await run(5);
  if (played.length !== 1) problems.push('la misma frase con otro apostrofo no usa su grabacion');

  played.length = 0;
  audio.setSpeed('slow');
  audio.speak(lines[0].text);
  await run(5);
  audio.setExamMode(true);
  audio.speak(lines[0].text);
  await run(5);
  audio.setExamMode(false);
  audio.setSpeed('normal');
  if (!(played[0]?.rate < 1) || played[1]?.rate !== 1) problems.push(`la grabacion no va mas lenta en lento ni a su velocidad en el simulacro (${played.map((/** @type {any} */ p) => p.rate).join(', ')})`);

  played.length = 0;
  audio.setMuted(true);
  let mutedEnd = 0;
  audio.speak(lines[0].text, { onEnd: () => { mutedEnd += 1; } });
  await run(3);
  audio.setMuted(false);
  if (played.length || mutedEnd !== 1) problems.push('con el sonido apagado suena la grabacion o no se avisa del final');

  // El archivo para otras tablets: vuelve igual, dos veces no repite, y lo
  // que no es un archivo de grabaciones se rechaza con un mensaje.
  const pack = JSON.stringify(await recordings.exportPack());
  recordings.resetForTests();
  if (recordings.has(lines[0].text)) problems.push('borrar las grabaciones no las borra');
  const first = await recordings.importPack(pack);
  const second = await recordings.importPack(pack);
  if (first.added !== 3 || second.replaced !== 3 || second.added !== 0 || recordings.count() !== 3) {
    problems.push(`el archivo de grabaciones no vuelve entero o repite (${JSON.stringify(first)} ${JSON.stringify(second)})`);
  }
  const back = await recordings.blobFor(lines[0].text);
  const bytes = back ? new Uint8Array(await back.arrayBuffer()) : null;
  if (!bytes || bytes.length !== 4000 || bytes.some((b) => b !== 7)) problems.push('una grabacion pasada por archivo no vuelve igual');
  const bad = /** @type {[string, string][]} */ ([
    ['', 'vacio'],
    ['hola', 'que no es JSON'],
    [JSON.stringify({ app: 'movers-album', format: 1, kind: 'class', albums: [] }), 'que es una copia de albumes'],
    [JSON.stringify({ app: 'movers-album', kind: 'voice', format: 9, lines: [] }), 'de otra version'],
    [JSON.stringify({ app: 'movers-album', kind: 'voice', format: 1, lines: [{ text: 'x', type: 'text/html', data: 'AAAA' }] }), 'con algo que no es audio'],
  ]);
  for (const [raw, what] of bad) {
    let message = '';
    try { recordings.parsePack(raw); } catch (error) { message = error instanceof Error ? error.message : ''; }
    if (!/[A-Z].*\.$/.test(message)) problems.push(`un archivo de grabaciones ${what} no se rechaza con un mensaje claro`);
  }
  recordings.resetForTests();

  // Las frases que se pueden grabar son exactamente las que dice la app (si
  // una cambiara en el juego y no aqui, su grabacion no se usaria nunca).
  const { VOICE_GROUPS } = await import('../src/data/voice-lines.js');
  const { spellItem, contrastFor } = await import('../src/games/letters/questions.js');
  const { NAMES } = await import('../src/data/letters.js');
  const { RUBRICS, partIntro } = await import('../src/data/print-rubrics.js');
  const groupTexts = (/** @type {string} */ id) => (VOICE_GROUPS.find((g) => g.id === id)?.lines ?? []).map((l) => l.text);
  if (groupTexts('names').join('|') !== NAMES.map((n) => spellItem(n, true).say).join('|')) problems.push('los nombres deletreados que se graban no son los que dice el dictado');
  if (groupTexts('letters')[9] !== contrastFor(/** @type {any} */ ({ kind: 'letter', want: 'J', got: 'G' }), spellItem('Jill', true)).say[0]) {
    problems.push('las letras que se graban no son las que dice el dictado al comparar');
  }
  if (!groupTexts('print').includes(partIntro(2, RUBRICS.l2))) problems.push('las instrucciones del examen impreso que se graban no son las que dice su pagina');
  for (const group of VOICE_GROUPS) {
    const texts = group.lines.map((l) => l.text);
    if (!texts.length || new Set(texts).size !== texts.length) problems.push(`el grupo "${group.title}" de la voz del profesor esta vacio o repite frases`);
    if (texts.some((t) => !t || t.length > 400)) problems.push(`el grupo "${group.title}" tiene una frase vacia o demasiado larga para guardarla`);
  }

  // La pantalla: grabar una frase con el microfono y que se use.
  const mic = createBrowser({ speech: true, media: true, seed: 9 });
  browser.uninstall();
  mic.install();
  try {
    const { renderVoice, leaveVoice } = await import('../src/ui/voice.js');
    const root = mic.document.createElement('div');
    mic.document.body.append(root);
    renderVoice(root);
    const button = (/** @type {RegExp} */ label) => root.querySelectorAll('button').find((b) => label.test(b.textContent ?? '') && !b.disabled);
    button(/Record/)?.click();
    for (let i = 0; i < 6; i += 1) { await settle(2); mic.clock.advance(100); }
    if (!mic.mic?.live) problems.push('al grabar con la voz del profesor no se abre el microfono');
    button(/Stop/)?.click();
    for (let i = 0; i < 10; i += 1) { await settle(2); mic.clock.advance(100); }
    const first = VOICE_GROUPS[0].lines[0].text;
    if (!recordings.has(first)) problems.push('grabar una frase en "Your voice" no la guarda');
    if (mic.mic?.live) problems.push('despues de grabar, el microfono se queda abierto');
    if (!/1 of \d+/.test(root.textContent)) problems.push('"Your voice" no cuenta la frase grabada');
    button(/Record/)?.click();
    for (let i = 0; i < 4; i += 1) { await settle(2); mic.clock.advance(100); }
    leaveVoice();
    if (mic.mic?.live) problems.push('salir de "Your voice" grabando deja el microfono abierto');
    for (const e of mic.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
  } finally {
    mic.uninstall();
    browser.install();
    recordings.resetForTests();
  }
  return problems;
}
