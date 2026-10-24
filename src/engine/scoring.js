export const MAX_SHIELDS = 5;

export function shieldsFor(correct, total) {
  if (total <= 0) return 0;
  const ratio = correct / total;
  if (ratio >= 1) return 5;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export function verdict(shields) {
  if (shields >= 5) return 'Perfect! Every single one right.';
  if (shields === 4) return 'Really good. Almost perfect.';
  if (shields === 3) return 'Good work. Listen again for the small words.';
  if (shields === 2) return 'Nice try. Play it once more.';
  return 'Keep going. You get better every time.';
}
