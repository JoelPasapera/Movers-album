const boat = (id, x, y, s, tilt = 0) => `
  <g class="paintable" data-obj="${id}" transform="rotate(${tilt} ${x} ${y})">
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - s * 2.2}" stroke="#14204A" stroke-width="4"/>
    <polygon class="fillable"
             points="${x + 0.16 * s},${y - s * 2.1} ${x + 1.7 * s},${y - 0.2 * s} ${x + 0.16 * s},${y - 0.2 * s}"
             fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <polygon class="fillable"
             points="${x - 2 * s},${y} ${x + 2 * s},${y} ${x + 1.5 * s},${y + 0.62 * s} ${x - 1.5 * s},${y + 0.62 * s}"
             fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
  </g>`;

const shell = (id, cx, cy, r) => `
  <g class="paintable" data-obj="${id}">
    <path class="fillable" d="M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z"
          fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r}" stroke="#14204A" stroke-width="2.5"/>
    <line x1="${cx}" y1="${cy}" x2="${cx - r * 0.7}" y2="${cy - r * 0.7}" stroke="#14204A" stroke-width="2.5"/>
    <line x1="${cx}" y1="${cy}" x2="${cx + r * 0.7}" y2="${cy - r * 0.7}" stroke="#14204A" stroke-width="2.5"/>
  </g>`;

const fish = (id, x, y, flip = 1) => `
  <g class="paintable" data-obj="${id}" transform="translate(${x} ${y}) scale(${flip} 1)">
    <ellipse class="fillable" cx="0" cy="0" rx="24" ry="15" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <polygon class="fillable" points="-22,0 -40,-14 -40,14" fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="12" cy="-4" r="2.8" fill="#14204A"/>
  </g>`;

export const BEACH = {
  id: 'beach',
  title: 'At the beach',
  writeTarget: { id: 'sign-text', word: 'drinks', x: 700, y: 300 },
  objects: [
    { id: 'boat-sea', family: 'boat', phrase: 'the boat in the sea' },
    { id: 'boat-island', family: 'boat', phrase: 'the boat next to the island' },
    { id: 'boat-sand', family: 'boat', phrase: 'the boat on the sand' },
    { id: 'shell-rock', family: 'shell', phrase: 'the shell next to the rock' },
    { id: 'shell-towel', family: 'shell', phrase: 'the shell on the towel' },
    { id: 'shell-water', family: 'shell', phrase: 'the shell in the water' },
    { id: 'fish-island', family: 'fish', phrase: 'the fish in front of the island' },
    { id: 'fish-boat', family: 'fish', phrase: 'the fish under the boat' },
  ],
  svg: `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A beach with boats, shells, fish, an island, a rock, a towel and a drinks hut">
  <rect x="0" y="0" width="800" height="470" fill="#DFF0FF"/>
  <circle cx="712" cy="66" r="36" fill="#FFC523" stroke="#14204A" stroke-width="4"/>
  <rect x="0" y="190" width="800" height="150" fill="#6FC4E8"/>
  <path d="M0 330 Q 190 306 380 328 Q 590 352 800 322 L800 470 L0 470 Z" fill="#F7E2A8"/>
  <path d="M0 400 Q 240 384 460 406 Q 640 424 800 402 L800 470 L0 470 Z" fill="#EFD48A"/>

  <path d="M40 232 q 22 -14 44 0 t 44 0" fill="none" stroke="#4EA9D4" stroke-width="4" stroke-linecap="round"/>
  <path d="M560 250 q 22 -14 44 0 t 44 0" fill="none" stroke="#4EA9D4" stroke-width="4" stroke-linecap="round"/>
  <path d="M300 312 q 22 -14 44 0 t 44 0" fill="none" stroke="#4EA9D4" stroke-width="4" stroke-linecap="round"/>

  <g>
    <path d="M96 192 q 68 -34 136 0 Z" fill="#7ED07A" stroke="#14204A" stroke-width="4"/>
    <rect x="158" y="140" width="12" height="52" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <path d="M164 142 q -44 -22 -58 6 q 34 -12 58 4 Z" fill="#3FA85F" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <path d="M164 142 q 44 -22 58 6 q -34 -12 -58 4 Z" fill="#3FA85F" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
  </g>

  <g>
    <path d="M262 418 q 18 -46 54 -30 q 34 -22 46 30 Z" fill="#9AA3B2" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
  </g>

  <g transform="rotate(-5 470 412)">
    <rect x="404" y="386" width="132" height="52" rx="6" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <rect x="404" y="398" width="132" height="12" fill="#FF6EA6"/>
    <rect x="404" y="418" width="132" height="12" fill="#FF6EA6"/>
  </g>

  <g>
    <rect x="626" y="300" width="150" height="104" fill="#FFF3D6" stroke="#14204A" stroke-width="4"/>
    <polygon points="608,300 701,242 794,300" fill="#3FA85F" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <rect x="650" y="334" width="42" height="70" fill="#8A4FC8" stroke="#14204A" stroke-width="4"/>
    <circle cx="686" cy="368" r="4.5" fill="#14204A"/>
    <rect x="712" y="334" width="46" height="38" fill="#BEE3FF" stroke="#14204A" stroke-width="4"/>
    <rect x="640" y="286" width="122" height="30" rx="6" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <text id="sign-text" x="701" y="308" text-anchor="middle"
          font-family="'Baloo 2', sans-serif" font-weight="800" font-size="21" fill="#14204A"></text>
  </g>

  ${boat('boat-sea', 470, 258, 26, -4)}
  ${boat('boat-island', 232, 214, 17, 3)}
  ${boat('boat-sand', 122, 412, 24, -6)}

  ${shell('shell-rock', 344, 434, 20)}
  ${shell('shell-towel', 470, 396, 16)}
  ${shell('shell-water', 574, 316, 18)}

  ${fish('fish-island', 300, 272, 1)}
  ${fish('fish-boat', 486, 306, -1)}
</svg>`,
};
