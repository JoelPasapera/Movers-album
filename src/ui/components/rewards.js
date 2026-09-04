import { h } from '../../core/dom.js';
import { topicProgress } from '../../engine/progress.js';

export function shieldRow(count, max = 5) {
  return h('div', { class: 'shields' }, Array.from({ length: max }, (unused, i) => h('div', {
    class: `shield${i < count ? '' : ' shield--off'}`,
  })));
}

// Distingue tres situaciones que antes daban el mismo mensaje:
// no acertar nada, no quedar cromos, y ganar cromos.
export function stickerBlock(topic, unlocked, earned) {
  if (unlocked.length) {
    return h('div', {}, [
      h('div', { class: 'result__stickers' }, unlocked.map((word) => h('div', {
        class: 'cromo pop',
        style: `background:${topic.tint};width:88px`,
      }, [
        word.icon ? h('div', { class: 'face' }, word.icon) : null,
        h('b', { style: word.icon ? null : 'font-size:17px' }, word.word),
      ]))),
      h('p', {}, `${unlocked.length} new sticker${unlocked.length > 1 ? 's' : ''} for your album`),
    ]);
  }
  const { have, total } = topicProgress(topic.id);
  if (have >= total) {
    return h('p', {}, `Your ${topic.label} page is full. Try another topic.`);
  }
  if (!earned) {
    return h('p', {}, 'No stickers this time. Have another go and you will get some.');
  }
  return h('p', {}, 'No new stickers this time.');
}
