// @ts-check
// El titulo de la pestana (y lo primero que lee un lector de pantalla al
// cambiar de pagina): el nombre de la pantalla y el de la web.

const SITE = 'My Movers album';

/** @param {string | null | undefined} [name] */
export function setPageTitle(name) {
  const clean = name?.trim();
  document.title = clean ? `${clean} · ${SITE}` : SITE;
}
