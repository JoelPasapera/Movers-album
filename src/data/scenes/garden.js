// Una sola escena que se dibuja dos veces con valores distintos.
// Cada ranura (slot) tiene sus variantes y la frase modelo que el alumno
// tiene que decir: "Here the ball is red, but here it is blue."

export const SLOTS = [
  {
    id: 'sky',
    values: ['sunny', 'cloudy'],
    sentence: (a, b) => `Here it is ${a}, but here it is ${b}.`,
  },
  {
    id: 'ball',
    values: ['red', 'blue', 'green', 'yellow'],
    sentence: (a, b) => `Here the ball is ${a}, but here it is ${b}.`,
  },
  {
    id: 'kite',
    values: ['purple', 'orange', 'pink', 'red'],
    sentence: (a, b) => `Here the kite is ${a}, but here it is ${b}.`,
  },
  {
    id: 'flowers',
    values: ['three', 'four', 'five'],
    sentence: (a, b) => `Here there are ${a} flowers, but here there are ${b}.`,
  },
  {
    id: 'cat',
    values: ['on the box', 'next to the box'],
    sentence: (a, b) => `Here the cat is ${a}, but here it is ${b}.`,
  },
  {
    id: 'bird',
    values: ['in the tree', 'in the sky'],
    sentence: (a, b) => `Here the bird is ${a}, but here it is ${b}.`,
  },
];

const HEX = {
  red: '#E33B2E', blue: '#1F7BE0', green: '#2BA84A', yellow: '#FFC523',
  purple: '#8A4FC8', orange: '#F5811F', pink: '#FF6EA6',
};

const COUNT = { three: 3, four: 4, five: 5 };

const flower = (x, y) => `
  <g>
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 26}" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="${x}" cy="${y - 32}" r="10" fill="#FF6EA6" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="${x}" cy="${y - 32}" r="3.5" fill="#FFC523"/>
  </g>`;

const cat = (x, y) => `
  <g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="22" ry="14" fill="#F5B942" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="17" cy="-13" r="12" fill="#F5B942" stroke="#14204A" stroke-width="3.5"/>
    <polygon points="9,-22 12,-33 19,-24" fill="#F5B942" stroke="#14204A" stroke-width="3"/>
    <polygon points="24,-24 27,-33 30,-22" fill="#F5B942" stroke="#14204A" stroke-width="3"/>
    <circle cx="14" cy="-14" r="2" fill="#14204A"/>
    <circle cx="22" cy="-14" r="2" fill="#14204A"/>
    <path d="M -22 -2 q -14 -10 -8 -22" fill="none" stroke="#14204A" stroke-width="3.5"/>
  </g>`;

const bird = (x, y) => `
  <g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="0" rx="13" ry="9" fill="#1F7BE0" stroke="#14204A" stroke-width="3.5"/>
    <circle cx="10" cy="-8" r="7" fill="#1F7BE0" stroke="#14204A" stroke-width="3.5"/>
    <polygon points="16,-9 25,-6 16,-3" fill="#F5811F" stroke="#14204A" stroke-width="2.5"/>
    <circle cx="12" cy="-10" r="1.8" fill="#14204A"/>
  </g>`;

export function renderScene(config) {
  const flowers = Array.from({ length: COUNT[config.flowers] }, (unused, i) => flower(38 + i * 52, 282)).join('');

  const sky = config.sky === 'sunny'
    ? `<g data-slot="sky"><circle cx="296" cy="52" r="28" fill="#FFC523" stroke="#14204A" stroke-width="4"/></g>`
    : `<g data-slot="sky"><path d="M262 60 a22 22 0 0 1 40 -12 a20 20 0 0 1 30 12 a16 16 0 0 1 -4 30 h-58 a16 16 0 0 1 -8 -30 Z" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/></g>`;

  const catPos = config.cat === 'on the box' ? [258, 200] : [196, 254];
  const birdPos = config.bird === 'in the tree' ? [86, 86] : [206, 52];

  return `
<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" class="diff-scene" role="img" aria-label="A garden with a tree, a box, a cat, a bird, a ball, a kite and some flowers">
  <rect x="0" y="0" width="360" height="300" fill="#DFF0FF"/>
  <path d="M0 300 L0 208 Q 180 190 360 206 L360 300 Z" fill="#BFE6A8"/>
  <rect x="20" y="140" width="18" height="70" fill="#96602F" stroke="#14204A" stroke-width="4"/>
  <circle cx="70" cy="112" r="52" fill="#4EB86A" stroke="#14204A" stroke-width="4"/>
  <circle cx="29" cy="140" r="30" fill="#4EB86A" stroke="#14204A" stroke-width="4"/>
  <rect x="228" y="216" width="66" height="48" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
  <line x1="228" y1="240" x2="294" y2="240" stroke="#14204A" stroke-width="3"/>
  ${sky}
  <g data-slot="kite">
    <line x1="150" y1="96" x2="150" y2="126" stroke="#14204A" stroke-width="3"/>
    <polygon points="150,58 172,84 150,110 128,84" fill="${HEX[config.kite]}" stroke="#14204A" stroke-width="4" stroke-linejoin="round"/>
  </g>
  <g data-slot="ball">
    <circle cx="104" cy="248" r="21" fill="${HEX[config.ball]}" stroke="#14204A" stroke-width="4"/>
    <path d="M83 248 q21 -16 42 0" fill="none" stroke="#14204A" stroke-width="2.5"/>
  </g>
  <g data-slot="flowers">${flowers}</g>
  <g data-slot="cat">${cat(catPos[0], catPos[1])}</g>
  <g data-slot="bird">${bird(birdPos[0], birdPos[1])}</g>
</svg>`;
}
