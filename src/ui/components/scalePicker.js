// @ts-check
// La escala del examinador, tal cual: tres criterios de 0 a 5 con lo que
// significa cada banda. La usan el panel del profesor (puntuar a un alumno
// despues de oirle) y el Speaking cara a cara (ui/examiner.js).

import { h } from '../../core/dom.js';
import { SPEAKING_SCALE, BAND_MAX, BAND_NOTES } from '../../data/speaking-scale.js';

/**
 * @param {{ onChange?: (complete: boolean) => void }} [o] onChange: se llama al
 *   elegir una banda, con si ya estan las tres
 * @returns {{ element: HTMLElement, bands: () => Record<string, number>, complete: () => boolean }}
 */
export function scalePicker({ onChange } = {}) {
  /** @type {Record<string, number>} */
  const bands = {};
  const complete = () => SPEAKING_SCALE.every((c) => bands[c.id] !== undefined);
  /** @param {any} criterion @param {number} band */
  const bandText = (criterion, band) => criterion.bands[band] ?? BAND_NOTES[band];

  const blocks = SPEAKING_SCALE.map((criterion) => {
    const detail = h('p', { class: 'scale-detail' }, 'Pick a band to see what it means.');
    /** @type {HTMLButtonElement[]} */
    const buttons = [];
    for (let band = BAND_MAX; band >= 0; band -= 1) {
      buttons.push(h('button', {
        class: 'btn btn--ghost scale-band',
        'aria-pressed': 'false',
        'aria-label': `${criterion.label}: ${band}`,
        onClick: (/** @type {Event} */ e) => {
          bands[criterion.id] = band;
          for (const b of buttons) b.setAttribute('aria-pressed', 'false');
          /** @type {HTMLElement} */ (e.currentTarget).setAttribute('aria-pressed', 'true');
          detail.textContent = `${band}: ${bandText(criterion, band)}`;
          onChange?.(complete());
        },
      }, String(band)));
    }
    return h('div', { class: 'scale-block' }, [
      h('h3', {}, criterion.label),
      h('p', { class: 'scale-aspects' }, criterion.aspects.join(' · ')),
      h('div', { class: 'scale-bands' }, buttons),
      detail,
    ]);
  });

  return { element: h('div', { class: 'scale-picker' }, blocks), bands: () => ({ ...bands }), complete };
}
