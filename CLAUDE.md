# CLAUDE.md

## §0 — Antes de nada

Lee `README.md` y `REVIEW.md` al empezar la sesión, y repite en voz alta la regla
que contienen.

Antes de dar cualquier trabajo por terminado, ejecuta:

```
npm run check
```

Si hay algo rojo, se arregla antes de entregar. Si todo está verde, se entrega.

Nunca ejecutes `npm run check:update` para tapar un fallo. La línea base solo se
sube cuando algo ha mejorado de verdad y todo lo demás está en verde.

## §1 — Qué es esto

Web de práctica para el examen Cambridge English A1 Movers, para niños de 8 a 10
años. Interfaz en inglés. Sin build, sin dependencias, sin conexión.

Se sirve con `npm start` o `npx serve .`. Abrir `index.html` a pelo no funciona:
son módulos ES y el navegador los bloquea desde el disco.

## §2 — Cómo está montado

```
README.md            empieza por aqui
index.html
src/
  main.js              arranque y rutas
  core/                dom, eventos, router, estado, perfiles, audio, voz
  data/                syllabus, vocabulario, temas y contenido de cada juego
  engine/              puntuación y progreso
  games/               registro + un módulo por juego (15)
  ui/                  barra, álbum, perfiles, panel del profesor, componentes
  styles/              fuentes, tokens, base y estilos por vista
  fonts/               woff2 empaquetados
checks/                la batería de comprobaciones
tools/                 el generador del álbum desde el PDF oficial
```

Cada juego expone `mount(root, ctx)` y devuelve `{ destroy }`. Añadir uno nuevo
no obliga a tocar los demás.

## §3 — Reglas que no se negocian

- El contenido en inglés solo usa vocabulario de Starters y Movers.
- Un icono no puede representar a dos palabras distintas.
- Nada de peticiones externas desde `index.html`.
- Los datos de cada niño se quedan en su navegador.
- El material de Cambridge no se copia: se usa el syllabus público.
