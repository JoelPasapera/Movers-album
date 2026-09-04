const kite = (id, cx, cy, s, rot = 0) => `
  <g class="paintable" data-obj="${id}" transform="rotate(${rot} ${cx} ${cy})">
    <line x1="${cx}" y1="${cy + s}" x2="${cx}" y2="${cy + s * 2.1}" stroke="#14204A" stroke-width="3"/>
    <polygon class="fillable" points="${cx},${cy - s} ${cx + s * 0.72},${cy} ${cx},${cy + s} ${cx - s * 0.72},${cy}"
             fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <line x1="${cx}" y1="${cy - s}" x2="${cx}" y2="${cy + s}" stroke="#14204A" stroke-width="2.5"/>
    <line x1="${cx - s * 0.72}" y1="${cy}" x2="${cx + s * 0.72}" y2="${cy}" stroke="#14204A" stroke-width="2.5"/>
  </g>`;

const ball = (id, cx, cy, r) => `
  <g class="paintable" data-obj="${id}">
    <circle class="fillable" cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <path d="M ${cx - r} ${cy} Q ${cx} ${cy - r * 0.75} ${cx + r} ${cy}" fill="none" stroke="#14204A" stroke-width="2.5"/>
    <path d="M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.75} ${cx + r} ${cy}" fill="none" stroke="#14204A" stroke-width="2.5"/>
  </g>`;

const bird = (id, x, y, flip = 1) => `
  <g class="paintable" data-obj="${id}" transform="translate(${x} ${y}) scale(${flip} 1)">
    <ellipse class="fillable" cx="0" cy="0" rx="19" ry="13" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <circle class="fillable" cx="15" cy="-11" r="10" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <polygon points="24,-12 36,-8 24,-4" fill="#F5811F" stroke="#14204A" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="17" cy="-13" r="2.2" fill="#14204A"/>
    <polygon points="-19,-2 -34,-12 -30,2" fill="none" stroke="#14204A" stroke-width="3.5" stroke-linejoin="round"/>
  </g>`;

export const PARK = {
  id: 'park',
  title: 'In the park',
  writeTarget: { id: 'sign-text', word: 'shop', x: 672, y: 232 },
  objects: [
    { id: 'kite-tree', family: 'kite', phrase: 'the kite in the tree' },
    { id: 'kite-sky', family: 'kite', phrase: 'the kite in the sky' },
    { id: 'kite-grass', family: 'kite', phrase: 'the kite on the grass' },
    { id: 'ball-tree', family: 'ball', phrase: 'the ball next to the tree' },
    { id: 'ball-table', family: 'ball', phrase: 'the ball under the table' },
    { id: 'ball-shop', family: 'ball', phrase: 'the ball in front of the shop' },
    { id: 'bird-roof', family: 'bird', phrase: 'the bird on the roof' },
    { id: 'bird-wall', family: 'bird', phrase: 'the bird on the wall' },
  ],
  svg: `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A park with kites, balls, birds, a tree, a table, a wall and a shop">
  <rect x="0" y="0" width="800" height="470" fill="#DFF0FF"/>
  <path d="M0 470 L0 318 Q 200 296 400 312 Q 620 328 800 306 L800 470 Z" fill="#BFE6A8"/>
  <path d="M0 470 L0 402 Q 260 386 470 410 Q 640 430 800 414 L800 470 Z" fill="#A9DB90"/>

  <g>
    <rect x="128" y="238" width="30" height="92" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <circle cx="143" cy="200" r="76" fill="#4EB86A" stroke="#14204A" stroke-width="4"/>
    <circle cx="96" cy="228" r="46" fill="#4EB86A" stroke="#14204A" stroke-width="4"/>
    <circle cx="192" cy="230" r="46" fill="#4EB86A" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="278" y="300" width="126" height="14" rx="4" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="288" y="314" width="10" height="34" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <rect x="384" y="314" width="10" height="34" fill="#96602F" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="428" y="258" width="140" height="60" fill="#D9836B" stroke="#14204A" stroke-width="4"/>
    <line x1="428" y1="278" x2="568" y2="278" stroke="#14204A" stroke-width="3"/>
    <line x1="428" y1="298" x2="568" y2="298" stroke="#14204A" stroke-width="3"/>
    <line x1="470" y1="258" x2="470" y2="278" stroke="#14204A" stroke-width="3"/>
    <line x1="526" y1="258" x2="526" y2="278" stroke="#14204A" stroke-width="3"/>
    <line x1="450" y1="278" x2="450" y2="298" stroke="#14204A" stroke-width="3"/>
    <line x1="506" y1="278" x2="506" y2="298" stroke="#14204A" stroke-width="3"/>
    <line x1="450" y1="298" x2="450" y2="318" stroke="#14204A" stroke-width="3"/>
    <line x1="506" y1="298" x2="506" y2="318" stroke="#14204A" stroke-width="3"/>
  </g>

  <g>
    <rect x="596" y="196" width="156" height="126" fill="#FFF3D6" stroke="#14204A" stroke-width="4"/>
    <polygon points="580,196 674,132 768,196" fill="#E3625A" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <rect x="622" y="252" width="46" height="70" fill="#8A4FC8" stroke="#14204A" stroke-width="4"/>
    <circle cx="660" cy="288" r="4.5" fill="#14204A"/>
    <rect x="690" y="252" width="44" height="40" fill="#BEE3FF" stroke="#14204A" stroke-width="4"/>
    <rect x="612" y="214" width="124" height="30" rx="6" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <text id="sign-text" x="674" y="236" text-anchor="middle"
          font-family="'Baloo 2', sans-serif" font-weight="800" font-size="21" fill="#14204A"></text>
  </g>

  ${kite('kite-sky', 430, 84, 40, 12)}
  ${kite('kite-tree', 150, 186, 34, -8)}
  ${kite('kite-grass', 236, 392, 32, 66)}

  ${ball('ball-tree', 214, 344, 22)}
  ${ball('ball-table', 336, 336, 18)}
  ${ball('ball-shop', 606, 394, 24)}

  ${bird('bird-roof', 700, 154, 1)}
  ${bird('bird-wall', 512, 236, -1)}
</svg>`,
};
