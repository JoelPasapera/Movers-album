const book = (id, x, y, s, tilt = 0) => `
  <g class="paintable" data-obj="${id}" transform="rotate(${tilt} ${x} ${y})">
    <rect class="fillable" x="${x - 30 * s}" y="${y - 22 * s}" width="${60 * s}" height="${44 * s}"
          rx="${4 * s}" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <line x1="${x}" y1="${y - 22 * s}" x2="${x}" y2="${y + 22 * s}" stroke="#14204A" stroke-width="3.5"/>
    <line x1="${x - 22 * s}" y1="${y - 10 * s}" x2="${x - 8 * s}" y2="${y - 10 * s}" stroke="#14204A" stroke-width="2.5"/>
    <line x1="${x - 22 * s}" y1="${y}" x2="${x - 8 * s}" y2="${y}" stroke="#14204A" stroke-width="2.5"/>
  </g>`;

const bag = (id, x, y, s) => `
  <g class="paintable" data-obj="${id}">
    <path d="M ${x - 26 * s} ${y - 34 * s} a ${26 * s} ${26 * s} 0 0 1 ${52 * s} 0"
          fill="none" stroke="#14204A" stroke-width="4"/>
    <rect class="fillable" x="${x - 30 * s}" y="${y - 34 * s}" width="${60 * s}" height="${46 * s}"
          rx="${6 * s}" fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <rect x="${x - 12 * s}" y="${y - 22 * s}" width="${24 * s}" height="${14 * s}"
          fill="none" stroke="#14204A" stroke-width="3"/>
  </g>`;

const pencil = (id, x, y, s, tilt = 0) => `
  <g class="paintable" data-obj="${id}" transform="rotate(${tilt} ${x} ${y})">
    <rect class="fillable" x="${x - 34 * s}" y="${y - 7 * s}" width="${56 * s}" height="${14 * s}"
          fill="#FFFFFF" stroke="#14204A" stroke-width="4"/>
    <polygon points="${x + 22 * s},${y - 7 * s} ${x + 36 * s},${y} ${x + 22 * s},${y + 7 * s}"
             fill="#E0A85C" stroke="#14204A" stroke-width="3.5" stroke-linejoin="round"/>
    <line x1="${x - 34 * s}" y1="${y - 7 * s}" x2="${x - 34 * s}" y2="${y + 7 * s}"
          stroke="#14204A" stroke-width="4"/>
  </g>`;

export const CLASSROOM = {
  id: 'classroom',
  title: 'In the classroom',
  writeTarget: { id: 'sign-text', word: 'school', x: 620, y: 150 },
  objects: [
    { id: 'book-desk', family: 'book', phrase: 'the book on the desk' },
    { id: 'book-chair', family: 'book', phrase: 'the book under the chair' },
    { id: 'book-box', family: 'book', phrase: 'the book in the box' },
    { id: 'bag-desk', family: 'bag', phrase: 'the bag next to the desk' },
    { id: 'bag-door', family: 'bag', phrase: 'the bag next to the door' },
    { id: 'bag-window', family: 'bag', phrase: 'the bag under the window' },
    { id: 'pencil-desk', family: 'pencil', phrase: 'the pencil on the desk' },
    { id: 'pencil-floor', family: 'pencil', phrase: 'the pencil on the floor' },
  ],
  svg: `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img"
     aria-label="A classroom with books, bags, pencils, a desk, a chair, a box, a door and a window">
  <rect x="0" y="0" width="800" height="470" fill="#FFF3D6"/>
  <rect x="0" y="352" width="800" height="118" fill="#E0B77E"/>
  <line x1="0" y1="352" x2="800" y2="352" stroke="#14204A" stroke-width="4"/>

  <g>
    <rect x="536" y="70" width="216" height="150" rx="8" fill="#FFFFFF" stroke="#14204A" stroke-width="5"/>
    <text id="sign-text" x="644" y="158" text-anchor="middle"
          font-family="'Baloo 2', sans-serif" font-weight="800" font-size="46" fill="#14204A"></text>
  </g>

  <g>
    <rect x="30" y="86" width="128" height="184" rx="6" fill="#C98A48" stroke="#14204A" stroke-width="5"/>
    <circle cx="140" cy="184" r="7" fill="#14204A"/>
  </g>

  <g>
    <rect x="286" y="96" width="150" height="118" fill="#BEE3FF" stroke="#14204A" stroke-width="5"/>
    <line x1="361" y1="96" x2="361" y2="214" stroke="#14204A" stroke-width="4"/>
    <line x1="286" y1="155" x2="436" y2="155" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="252" y="272" width="220" height="16" rx="4" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="272" y="288" width="14" height="64" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <rect x="438" y="288" width="14" height="64" fill="#96602F" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="560" y="286" width="86" height="14" rx="3" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="566" y="230" width="12" height="56" fill="#C98A48" stroke="#14204A" stroke-width="4"/>
    <rect x="566" y="300" width="12" height="52" fill="#96602F" stroke="#14204A" stroke-width="4"/>
    <rect x="628" y="300" width="12" height="52" fill="#96602F" stroke="#14204A" stroke-width="4"/>
  </g>

  <g>
    <rect x="672" y="286" width="104" height="66" fill="#D8B078" stroke="#14204A" stroke-width="5"/>
    <line x1="672" y1="306" x2="776" y2="306" stroke="#14204A" stroke-width="3.5"/>
  </g>

  ${book('book-desk', 320, 258, 1, -4)}
  ${book('book-chair', 602, 336, 0.8, 6)}
  ${book('book-box', 724, 300, 0.72, -8)}

  ${bag('bag-desk', 214, 348, 1)}
  ${bag('bag-door', 96, 344, 0.86)}
  ${bag('bag-window', 366, 348, 0.78)}

  ${pencil('pencil-desk', 408, 262, 1, -3)}
  ${pencil('pencil-floor', 486, 410, 0.9, 14)}
</svg>`,
};
