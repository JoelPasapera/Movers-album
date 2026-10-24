// Piezas sueltas que se combinan para dibujar cada viñeta.
// Todo se dibuja alrededor del origen, con los pies en y = 0,
// para poder colocarlo con translate(x, y) sin recalcular nada.

const INK = '#14204A';
const st = (w = 3) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const wrap = (x, y, s, body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

const MOUTH = {
  happy: `<path d="M -5 -40 q 5 5 10 0" fill="none" ${st(2)}/>`,
  sad: `<path d="M -5 -37 q 5 -5 10 0" fill="none" ${st(2)}/>`,
  scared: `<ellipse cx="0" cy="-39" rx="4" ry="5" fill="${INK}"/>`,
};

export const PIECES = {
  person: (x, y, s = 1, o = {}) => {
    const shirt = o.shirt ?? '#E33B2E';
    const hair = o.hair ?? '#6B4423';
    const tall = o.tall ? 1.28 : 1;
    const tears = o.mood === 'sad'
      ? `<path d="M -6 -42 l -1 7" ${st(2)}/><path d="M 6 -42 l 1 7" ${st(2)}/>` : '';
    return wrap(x, y, s * tall, `
      <line x1="-6" y1="-16" x2="-6" y2="0" ${st(5)}/>
      <line x1="6" y1="-16" x2="6" y2="0" ${st(5)}/>
      <rect x="-12" y="-38" width="24" height="24" rx="6" fill="${shirt}" ${st()}/>
      <line x1="-12" y1="-32" x2="-20" y2="-20" ${st(4)}/>
      <line x1="12" y1="-32" x2="20" y2="-20" ${st(4)}/>
      <circle cx="0" cy="-48" r="12" fill="#FFD9A8" ${st()}/>
      <path d="M -12 -50 a 12 12 0 0 1 24 0 q -12 -6 -24 0 Z" fill="${hair}" ${st(2.5)}/>
      <circle cx="-4" cy="-48" r="1.8" fill="${INK}"/>
      <circle cx="4" cy="-48" r="1.8" fill="${INK}"/>
      ${MOUTH[o.mood ?? 'happy']}
      ${tears}`);
  },

  cake: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -18 0 L -15 -16 h 30 L 18 0 Z" fill="#F5C9A0" ${st()}/>
    <path d="M -16 -14 q 8 6 16 0 q 8 6 16 0 l -1 -8 h -30 Z" fill="#FF6EA6" ${st()}/>
    <line x1="0" y1="-22" x2="0" y2="-30" ${st(2.5)}/>
    <ellipse cx="0" cy="-33" rx="2.5" ry="4" fill="#FFC523" ${st(2)}/>`),

  table: (x, y, s = 1) => wrap(x, y, s, `
    <rect x="-30" y="-24" width="60" height="7" rx="2" fill="#C98A48" ${st()}/>
    <line x1="-22" y1="-17" x2="-22" y2="0" ${st(5)}/>
    <line x1="22" y1="-17" x2="22" y2="0" ${st(5)}/>`),

  dog: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="-14" rx="20" ry="12" fill="#C98A48" ${st()}/>
    <circle cx="17" cy="-26" r="10" fill="#C98A48" ${st()}/>
    <path d="M 10 -34 q -5 -8 2 -9 q 5 3 4 9 Z" fill="#96602F" ${st(2.5)}/>
    <circle cx="20" cy="-27" r="1.8" fill="${INK}"/>
    <ellipse cx="26" cy="-23" rx="3" ry="2.5" fill="${INK}"/>
    <line x1="-9" y1="-4" x2="-9" y2="0" ${st(4)}/>
    <line x1="8" y1="-4" x2="8" y2="0" ${st(4)}/>
    <path d="M -19 -18 q -9 -6 -6 -14" fill="none" ${st(3)}/>`),

  kitten: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="-9" rx="14" ry="9" fill="#F5B942" ${st()}/>
    <circle cx="11" cy="-19" r="8" fill="#F5B942" ${st()}/>
    <polygon points="5,-25 7,-33 12,-27" fill="#F5B942" ${st(2.5)}/>
    <polygon points="15,-27 18,-33 20,-25" fill="#F5B942" ${st(2.5)}/>
    <circle cx="9" cy="-20" r="1.5" fill="${INK}"/>
    <circle cx="14" cy="-20" r="1.5" fill="${INK}"/>
    <path d="M -14 -11 q -9 -7 -4 -15" fill="none" ${st(3)}/>`),

  tree: (x, y, s = 1) => wrap(x, y, s, `
    <rect x="-6" y="-34" width="12" height="34" fill="#96602F" ${st()}/>
    <circle cx="0" cy="-48" r="26" fill="#4EB86A" ${st()}/>
    <circle cx="-19" cy="-36" r="15" fill="#4EB86A" ${st()}/>
    <circle cx="19" cy="-36" r="15" fill="#4EB86A" ${st()}/>`),

  shell: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -13 0 A 13 13 0 0 1 13 0 Z" fill="#FF9EC4" ${st()}/>
    <line x1="0" y1="0" x2="0" y2="-13" ${st(2)}/>
    <line x1="0" y1="0" x2="-9" y2="-9" ${st(2)}/>
    <line x1="0" y1="0" x2="9" y2="-9" ${st(2)}/>`),

  wave: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -34 0 q 8 -26 24 -20 q 14 5 10 -12 q 16 10 6 32 Z" fill="#4EA9D4" ${st()}/>`),

  hat: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="0" rx="20" ry="6" fill="#FFC523" ${st()}/>
    <path d="M -12 -1 a 12 11 0 0 1 24 0 Z" fill="#FFC523" ${st()}/>`),

  ticket: (x, y, s = 1) => wrap(x, y, s, `
    <rect x="-18" y="-24" width="36" height="24" rx="3" fill="#FFF3D6" ${st()}/>
    <line x1="-6" y1="-24" x2="-6" y2="0" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/>
    <line x1="2" y1="-17" x2="12" y2="-17" ${st(2)}/>
    <line x1="2" y1="-11" x2="12" y2="-11" ${st(2)}/>`),

  wheel: (x, y, s = 1) => wrap(x, y, s, `
    <line x1="-12" y1="0" x2="0" y2="-38" ${st()}/>
    <line x1="12" y1="0" x2="0" y2="-38" ${st()}/>
    <circle cx="0" cy="-38" r="30" fill="none" ${st(4)}/>
    <line x1="-30" y1="-38" x2="30" y2="-38" ${st(2.5)}/>
    <line x1="0" y1="-68" x2="0" y2="-8" ${st(2.5)}/>
    <circle cx="0" cy="-68" r="6" fill="#E33B2E" ${st(2.5)}/>
    <circle cx="0" cy="-8" r="6" fill="#1F7BE0" ${st(2.5)}/>
    <circle cx="-30" cy="-38" r="6" fill="#FFC523" ${st(2.5)}/>
    <circle cx="30" cy="-38" r="6" fill="#2BA84A" ${st(2.5)}/>`),

  icecream: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -8 -16 L 0 0 L 8 -16 Z" fill="#E0A85C" ${st()}/>
    <circle cx="0" cy="-22" r="9" fill="#FF9EC4" ${st()}/>
    <circle cx="0" cy="-33" r="8" fill="#FFF3D6" ${st()}/>`),

  raincloud: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -26 0 a 15 15 0 0 1 27 -9 a 13 13 0 0 1 21 9 Z" fill="#B9C4D4" ${st()}/>
    <line x1="-16" y1="6" x2="-20" y2="16" ${st(2.5)}/>
    <line x1="0" y1="6" x2="-4" y2="18" ${st(2.5)}/>
    <line x1="16" y1="6" x2="12" y2="16" ${st(2.5)}/>`),

  car: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -34 -12 l 8 -14 h 30 l 10 14 Z" fill="#1F7BE0" ${st()}/>
    <rect x="-38" y="-14" width="76" height="16" rx="5" fill="#1F7BE0" ${st()}/>
    <rect x="-22" y="-24" width="16" height="10" fill="#BEE3FF" ${st(2.5)}/>
    <rect x="-2" y="-24" width="16" height="10" fill="#BEE3FF" ${st(2.5)}/>
    <circle cx="-22" cy="2" r="7" fill="#3A3F4A" ${st(2.5)}/>
    <circle cx="22" cy="2" r="7" fill="#3A3F4A" ${st(2.5)}/>`),

  basket: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -20 -18 h 40 l -5 18 h -30 Z" fill="#C98A48" ${st()}/>
    <path d="M -12 -18 a 12 12 0 0 1 24 0" fill="none" ${st()}/>
    <rect x="-20" y="-22" width="40" height="6" fill="#FF6EA6" ${st(2.5)}/>`),

  milk: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -9 -22 h 18 l -3 22 h -12 Z" fill="#FFFFFF" ${st()}/>
    <path d="M -8 -14 h 16 l -2 14 h -12 Z" fill="#EFF4FF" ${st(2)}/>`),

  bike: (x, y, s = 1, o = {}) => wrap(x, y, s, `
    <circle cx="-16" cy="-10" r="10" fill="none" ${st()}/>
    <circle cx="16" cy="-10" r="10" fill="none" ${st()}/>
    <path d="M -16 -10 L -4 -10 L 4 -24 L 16 -10" fill="none" ${st()} stroke="${o.colour ?? INK}"/>
    <line x1="-4" y1="-10" x2="4" y2="-24" ${st()} stroke="${o.colour ?? INK}"/>
    <line x1="-8" y1="-26" x2="2" y2="-26" ${st(2.5)}/>`),

  ball: (x, y, s = 1, o = {}) => wrap(x, y, s, `
    <circle cx="0" cy="-11" r="11" fill="${o.colour ?? '#FFC523'}" ${st()}/>
    <path d="M -11 -11 q 11 -8 22 0" fill="none" ${st(2)}/>
    <path d="M -11 -11 q 11 8 22 0" fill="none" ${st(2)}/>`),

  fence: (x, y, s = 1) => wrap(x, y, s, `
    <line x1="-34" y1="-18" x2="34" y2="-18" ${st(3)} stroke="#D8B078"/>
    <line x1="-34" y1="-8" x2="34" y2="-8" ${st(3)} stroke="#D8B078"/>
    <line x1="-26" y1="-26" x2="-26" y2="0" ${st(3.5)} stroke="#D8B078"/>
    <line x1="0" y1="-26" x2="0" y2="0" ${st(3.5)} stroke="#D8B078"/>
    <line x1="26" y1="-26" x2="26" y2="0" ${st(3.5)} stroke="#D8B078"/>`),

  flower: (x, y, s = 1, o = {}) => wrap(x, y, s, `
    <line x1="0" y1="0" x2="0" y2="-16" ${st(2.5)} stroke="#2BA84A"/>
    <circle cx="0" cy="-21" r="7" fill="${o.colour ?? '#FF6EA6'}" ${st(2.5)}/>
    <circle cx="0" cy="-21" r="2.5" fill="#FFC523"/>`),

  mountain: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -46 0 L -14 -50 L 6 -26 L 20 -44 L 46 0 Z" fill="#9AA3B2" ${st()}/>
    <path d="M -14 -50 L -25 -34 q 11 6 22 0 Z" fill="#FFFFFF" ${st(2.5)}/>
    <path d="M 20 -44 L 12 -32 q 8 5 16 0 Z" fill="#FFFFFF" ${st(2.5)}/>`),

  river: (x, y, s = 1) => wrap(x, y, s, `
    <path d="M -50 0 q 20 -12 40 0 q 20 12 40 0 l 0 14 q -20 12 -40 0 q -20 -12 -40 0 Z"
          fill="#6FC4E8" ${st()}/>`),

  goat: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="-16" rx="19" ry="12" fill="#F2EDE2" ${st()}/>
    <circle cx="16" cy="-28" r="9" fill="#F2EDE2" ${st()}/>
    <path d="M 11 -35 q -4 -10 3 -12" fill="none" ${st(2.5)}/>
    <path d="M 21 -35 q 4 -10 -3 -12" fill="none" ${st(2.5)}/>
    <circle cx="19" cy="-29" r="1.7" fill="${INK}"/>
    <path d="M 14 -20 q 3 7 6 0" fill="#F2EDE2" ${st(2)}/>
    <line x1="-8" y1="-5" x2="-8" y2="0" ${st(4)}/>
    <line x1="8" y1="-5" x2="8" y2="0" ${st(4)}/>
    <line x1="-19" y1="-20" x2="-25" y2="-27" ${st(3)}/>`),

  box: (x, y, s = 1, o = {}) => wrap(x, y, s, `
    <rect x="-16" y="-18" width="32" height="18" rx="2" fill="${o.colour ?? '#C98A48'}" ${st()}/>
    <rect x="-18" y="-24" width="36" height="8" rx="2" fill="${o.colour ?? '#C98A48'}" ${st()}/>
    <rect x="-3" y="-24" width="6" height="8" fill="#FFC523" ${st(2)}/>`),

  camera: (x, y, s = 1) => wrap(x, y, s, `
    <rect x="-14" y="-18" width="28" height="18" rx="3" fill="#14204A" ${st()}/>
    <circle cx="0" cy="-9" r="6" fill="#BEE3FF" ${st(2.5)}/>
    <rect x="-10" y="-22" width="8" height="5" rx="1" fill="#8B93A6" ${st(2)}/>`),

  duck: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="-8" rx="13" ry="8" fill="#FFC523" ${st()}/>
    <circle cx="10" cy="-18" r="6" fill="#FFC523" ${st()}/>
    <path d="M 15 -18 l 7 2 l -7 2 Z" fill="#F5811F" ${st(2)}/>
    <circle cx="11" cy="-19" r="1.5" fill="${INK}"/>`),

  plate: (x, y, s = 1) => wrap(x, y, s, `
    <ellipse cx="0" cy="0" rx="20" ry="7" fill="#FFFFFF" ${st()}/>
    <ellipse cx="0" cy="-1" rx="12" ry="4" fill="none" ${st(2)}/>`),
};

export const BACKGROUNDS = {
  room: `<rect width="200" height="150" fill="#FFF3D6"/>
    <rect x="118" y="18" width="56" height="42" fill="#BEE3FF" ${st()}/>
    <line x1="146" y1="18" x2="146" y2="60" ${st(2.5)}/>
    <rect y="120" width="200" height="30" fill="#E0B77E"/>
    <line x1="0" y1="120" x2="200" y2="120" ${st()}/>`,
  garden: `<rect width="200" height="150" fill="#DFF0FF"/>
    <path d="M0 150 L0 104 Q 100 94 200 102 L200 150 Z" fill="#BFE6A8"/>`,
  beach: `<rect width="200" height="150" fill="#DFF0FF"/>
    <rect y="62" width="200" height="42" fill="#6FC4E8"/>
    <path d="M0 150 L0 100 Q 100 92 200 100 L200 150 Z" fill="#F7E2A8"/>`,
  fair: `<rect width="200" height="150" fill="#DFF0FF"/>
    <path d="M0 150 L0 108 Q 100 100 200 106 L200 150 Z" fill="#A9DB90"/>`,
  field: `<rect width="200" height="150" fill="#DFF0FF"/>
    <path d="M0 150 L0 100 Q 100 90 200 98 L200 150 Z" fill="#C9E89F"/>
    <path d="M0 150 L0 124 Q 100 116 200 122 L200 150 Z" fill="#A9DB90"/>`,
  incar: `<rect width="200" height="150" fill="#E2E5EC"/>
    <rect x="24" y="16" width="152" height="66" rx="8" fill="#BEE3FF" ${st()}/>
    <line x1="52" y1="24" x2="44" y2="74" stroke="#7FB6DE" stroke-width="3"/>
    <line x1="98" y1="24" x2="90" y2="74" stroke="#7FB6DE" stroke-width="3"/>
    <line x1="144" y1="24" x2="136" y2="74" stroke="#7FB6DE" stroke-width="3"/>
    <rect y="112" width="200" height="38" fill="#9AA3B2"/>
    <line x1="0" y1="112" x2="200" y2="112" ${st()}/>`,
};

export function renderPanel(art) {
  const bg = BACKGROUNDS[art.bg] ?? BACKGROUNDS.garden;
  const items = art.items
    .map(({ p, x, y, s = 1, o = {} }) => (PIECES[p] ? PIECES[p](x, y, s, o) : ''))
    .join('');
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" class="panel-art" aria-hidden="true">${bg}${items}</svg>`;
}
