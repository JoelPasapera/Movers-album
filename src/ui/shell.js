import { h, mount as fill } from '../core/dom.js';
import { on } from '../core/events.js';
import * as state from '../core/state.js';
import * as profiles from '../core/profiles.js';
import { totalShields } from '../engine/progress.js';
import { isMuted, setMuted, englishVoiceAvailable } from '../core/audio.js';
import * as router from '../core/router.js';

export function renderShell(container) {
  const shields = h('div', { class: 'shields' });
  const streak = h('div', { class: 'streak' });
  const who = h('button', { class: 'who-chip', onClick: () => router.go('/who') });
  const notice = h('p', { class: 'voice-notice hidden' });

  const mute = h('button', {
    class: 'btn btn--ghost mute',
    'aria-pressed': String(isMuted()),
    onClick: () => {
      const next = setMuted(!isMuted());
      mute.setAttribute('aria-pressed', String(next));
      mute.textContent = next ? 'Sound off' : 'Sound on';
    },
  }, isMuted() ? 'Sound off' : 'Sound on');

  function paint() {
    const total = totalShields();
    fill(shields, ...Array.from({ length: 5 }, (unused, i) => h('div', {
      class: `shield${i < total ? '' : ' shield--off'}`,
    })));
    const days = state.get().streak;
    streak.textContent = days > 0
      ? `${days} day${days > 1 ? 's' : ''} in a row`
      : 'Start today';
    who.textContent = profiles.current()?.name ?? 'Who is playing?';
  }

  function checkVoice() {
    if (englishVoiceAvailable()) {
      notice.classList.add('hidden');
      return;
    }
    notice.textContent = 'This device has no English voice, so the words may sound wrong. '
      + 'Add an English voice in your system settings.';
    notice.classList.remove('hidden');
  }

  const bar = h('div', { class: 'topbar' }, [
    h('button', {
      class: 'brand',
      onClick: () => router.go('/'),
      html: 'My <em>Movers</em> album',
    }),
    who,
    h('div', { class: 'topbar__spacer' }),
    mute,
    shields,
    streak,
  ]);

  fill(container, bar, notice);
  paint();
  checkVoice();
  window.speechSynthesis?.addEventListener?.('voiceschanged', checkVoice);
  on('state:changed', paint);
}
