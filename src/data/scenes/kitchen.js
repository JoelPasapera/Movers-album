const cup = (id, x, y, s) => `
  <g class="paintable" data-obj="${id}">
    <path class="fillable" d="M ${x - 20 * s} ${y - 30 * s} h ${40 * s} l ${-5 * s} ${30 * s} h ${-30 * s} Z"
          fill="#FFFFFF" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
    <path d="M ${x + 20 * s} ${y - 24 * s} a ${11 * s} ${11 * s} 0 0 1 0 ${18 * s}"
          fill="none" stroke="#14204A" stroke-width="4"/>
    <ellipse cx="${x}" cy="${y - 30 * s}" rx="${20 * s}" ry="${5 * s}"
             fill="none" stroke="#14204A" stroke-width="3"/>
  </g>`;

const apple = (id, x, y, s) => `
  <g class="paintable" data-obj="${id}">
    <circle class="fillable" cx="${x}" cy="${y}" r="${21 * s}" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <line x1="${x}" y1="${y - 20 * s}" x2="${x}" y2="${y - 32 * s}" stroke="#96602F" stroke-width="${4 * s}"/>
    <path d="M ${x} ${y - 29 * s} q ${13 * s} ${-9 * s} ${17 * s} ${3 * s} q ${-12 * s} ${5 * s} ${-17 * s} ${-3 * s} Z"
          fill="#2BA84A" stroke="#14204A" stroke-width="3" stroke-linejoin="round"/>
  </g>`;

const cat = (id, x, y, s, flip = 1) => `
  <g class="paintable" data-obj="${id}" transform="translate(${x} ${y}) scale(${flip * s} ${s})">
    <ellipse class="fillable" cx="0" cy="0" rx="30" ry="19" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <circle class="fillable" cx="24" cy="-20" r="16" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <polygon class="fillable" points="12,-31 15,-46 25,-33" fill="#FFFFFF" stroke="#14204A" stroke-width="3.5"/>
    <polygon class="fillable" points="31,-33 39,-46 41,-30" fill="#FFFFFF" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="19" cy="-21" r="2.6" fill="#14204A"/>
    <circle cx="30" cy="-21" r="2.6" fill="#14204A"/>
    <path d="M -30 -4 q -16 -12 -8 -26" fill="none" stroke="#14204A" stroke-width="4"/>
  </g>`;

export const KITCHEN = {
  id: 'kitchen-colour',
  title: 'In the kitchen',
  writeTarget: { id: 'sign-text', word: 'cake', x: 660, y: 128 },
  objects: [
    { id: 'cup-table', family: 'cup', phrase: 'the cup on the table' },
    { id: 'cup-cupboard', family: 'cup', phrase: 'the cup in the cupboard' },
    { id: 'cup-floor', family: 'cup', phrase: 'the cup on the floor' },
    { id: 'apple-plate', family: 'apple', phrase: 'the apple on the plate' },
    { id: 'apple-bowl', family: 'apple', phrase: 'the apple in the bowl' },
    { id: 'apple-chair', family: 'apple', phrase: 'the apple under the chair' },
    { id: 'cat-table', family: 'cat', phrase: 'the cat under the table' },
    { id: 'cat-window', family: 'cat', phrase: 'the cat next to the window' },
  ],
  svg: `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img"
     aria-label="A kitchen with cups, apples, cats, a table, a chair, a cupboard, a plate and a window">
  <rect x="0" y="0" width="800" height="470" fill="#E8F6EF"/>
  <rect x="0" y="344" width="800" height="126" fill="#D8B078"/>
  <line x1="0" y1="344" x2="800" y2="344" stroke="#14204A" stroke-width="4"/>

  <g>
    <rect x="44" y="60" width="222" height="150" rx="6" fill="#C98A48" stroke="#14204A" stroke-width="5"/>
    <line x1="155" y1="60" x2="155" y2="210" stroke="#14204A" stroke-width="4"/>
    <line x1="44" y1="140" x2="266" y2="140" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="143" cy="150" r="6" fill="#14204A"/>
    <circle cx="167" cy="150" r="6" fill="#14204A"/>
  </g>

  <g>
    <rect x="586" y="66" width="164" height="120" fill="#BEE3FF" stroke="#14204A" stroke-width="5"/>
    <line x1="668" y1="66" x2="668" y2="186" stroke="#14204A" stroke-width="4"/>
    <rect x="596" y="196" width="144" height="34" rx="6" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <text id="sign-text" x="668" y="222" text-anchor="middle"
          font-family="'Baloo 2', sans-serif" font-weight="800" font-size="25" fill="#14204A"></text>
  </g>

  <g>
    <rect x="256" y="266" width="252" height="18" rx="4" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="278" y="284" width="16" height="60" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <rect x="470" y="284" width="16" height="60" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <ellipse cx="322" cy="260" rx="42" ry="12" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <path d="M 424 244 q 34 0 34 16 h -68 q 0 -16 34 -16 Z" fill="#FFF3D6" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="574" y="290" width="94" height="14" rx="3" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="580" y="232" width="12" height="58" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="580" y="304" width="12" height="40" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <rect x="650" y="304" width="12" height="40" fill="#96602F" stroke="#14204A" stroke-width="4"/>
  </g>

  ${cup('cup-table', 384, 258, 0.92)}
  ${cup('cup-cupboard', 100, 128, 0.8)}
  ${cup('cup-floor', 172, 406, 0.86)}

  ${apple('apple-plate', 322, 246, 0.9)}
  ${apple('apple-bowl', 424, 244, 0.8)}
  ${apple('apple-chair', 620, 402, 0.9)}

  ${cat('cat-table', 372, 336, 0.9, 1)}
  ${cat('cat-window', 700, 330, 0.8, -1)}
</svg>`,
};
