# Mi Álbum Movers

Web de práctica para el examen **Cambridge English A1 Movers**, para niños de 8 a 10
años. Interfaz en inglés. Sin build, sin dependencias, sin conexión a internet.

Este archivo es el punto de entrada. Si eres una sesión nueva de Claude, léelo
entero antes de tocar nada, y después lee `CLAUDE.md` y `REVIEW.md`.

---

## 1. Lo primero que tienes que hacer

```
npm run check
```

Son 27 comprobaciones. Si sale **TODO EN VERDE**, el proyecto está sano y puedes
construir encima. Si sale algo rojo, eso es lo primero que se arregla.

Para ver la web:

```
npm start          # o: npx serve .
```

Abrir `index.html` con doble clic **no funciona**: son módulos ES y el navegador los
bloquea desde el disco. Hace falta servirlo.

## 2. Qué es esto y para quién

Lo usa un profesor de inglés que prepara a niños para el examen A1 Movers.
**El profesor no lee ni escribe código.** Todo lo técnico lo delega. Eso cambia dos
cosas:

- Los mensajes, avisos y errores se explican por consecuencias, no por implementación.
- La batería de comprobaciones existe precisamente porque él no puede revisar el
  código. Es su única garantía. Nunca la debilites para que pase algo.

Habla en español con él. La interfaz de la web va en inglés.

## 3. Estado actual

| Cobertura | |
|---|---|
| Partes del examen | **15 de 15** |
| Puntos escritos del examen | **64 de 64** |
| Wordlist oficial | **888 de 888**, todas con cromo y todas ejercitables |
| Gramática oficial de Movers | **25 de 25** estructuras |
| Tipos de actividad de los libros de Cambridge | **10** implementados |
| Piezas de contenido | **286** |
| Escenas dibujadas | **8** |

24 juegos: 15 que corresponden a partes del examen y 9 de entrenamiento.
Más un simulacro completo cronometrado con Statement of Results.

## 4. Cómo está montado

```
index.html            arranque, sin peticiones externas
package.json          scripts: check, check:update, start
src/
  main.js             rutas: album, tema, juego, simulacro, perfiles, profesor
  core/               dom, eventos, router, estado, almacenamiento, perfiles,
                      audio (con modo examen) y voz (micrófono)
  data/               syllabus, wordlist, temas, gramática y el contenido de
                      cada juego, más las escenas dibujadas
  engine/             puntuación, progreso, vocabulario, formas de palabra,
                      números y el motor del simulacro
  games/              registro + una carpeta por juego
  ui/                 barra, álbum, perfiles, panel del profesor, simulacro,
                      contenedor de juegos y componentes compartidos
  styles/             fuentes, tokens, base y estilos por vista
  fonts/              woff2 empaquetados (Baloo 2, Atkinson Hyperlegible)
checks/               las 13 comprobaciones y la línea base del trinquete
tools/                el generador del álbum desde el PDF oficial
```

Cada juego expone `mount(root, ctx)` y devuelve `{ destroy }`. Si `ctx.onFinish`
existe, el juego **entrega su resultado en vez de pintar su pantalla final**: así
funciona el simulacro. Añadir un juego no obliga a tocar los demás.

## 5. Cómo se trabaja aquí

El método que ha funcionado y que conviene mantener:

1. **Escribir el generador o el contenido.**
2. **Ejecutar `npm run check` inmediatamente.** No al final: después de cada tanda.
3. **Arreglar lo que salga rojo.** Siempre sale algo.
4. **Solo entonces, dar el trabajo por terminado.**

La batería no es burocracia. Cada comprobación existe porque ese error ya ocurrió
de verdad en este proyecto. Ejemplos reales que cazó:

- 28 palabras de nivel A2 Flyers coladas en contenido de A1 Movers.
- 55 palabras compartiendo el mismo dibujo, lo que hacía fallar a un niño que
  acertaba.
- El juego de colorear pidiendo identificar *the bench* y *the fence*, palabras que
  no están en el syllabus de Movers.
- Yes or no marcando como falsa la frase «The dog is in the garden», con el perro
  en el jardín.
- Seis marcas gramaticales (`adj`, `pron`, `conj`…) coladas como si fueran palabras.

### El trinquete

`checks/baseline.json` guarda los números conseguidos. **Si alguno baja, la
comprobación falla**, aunque todo lo demás esté verde. Eso es lo que impide perder
por el camino algo que ya funcionaba.

`npm run check:update` sube la marca. Solo después de tener todo verde y solo
cuando la mejora es real. Actualizar la línea base para tapar un retroceso es
hacerse trampas al solitario.

## 6. Reglas que no se negocian

- **El contenido en inglés solo usa vocabulario de Starters y Movers.** La
  comprobación 2 lo verifica palabra por palabra contra el PDF oficial.
- **Un icono no puede representar a dos palabras distintas.**
- **El vocabulario no se edita a mano.** Se cambia `tools/build-wordlist.py` y se
  regenera. Los cuatro archivos que genera llevan el aviso en la cabecera.
- **Nada de peticiones externas desde `index.html`.** Las fuentes van empaquetadas.
- **Los datos de cada niño se quedan en su navegador.** No hay servidor ni cuentas.
- **El reconocimiento de voz va apagado por defecto.** Chrome envía el audio a
  Google y son menores. Se enciende a mano y con aviso visible.
- **En el simulacro cada grabación suena dos veces, no tres.**
- **La gramática no resta en la Parte 6.** Lo dice el handbook de Cambridge.
- **Nunca se puntúa a cero por un fallo del reconocimiento de voz.**

## 7. Copyright: dónde está la línea

Esto se ha cuidado desde el principio y hay que seguir cuidándolo.

**Lo que sí se usa del material de Cambridge:**

- El **wordlist** (888 entradas) y la **lista de gramática** (25 estructuras). Son
  el syllabus: lo que hay que aprender, publicado para eso.
- La **estructura del examen**: 15 partes, sus puntos, sus tiempos, sus reglas.
  Son hechos.
- El **inventario de tipos de actividad** de sus libros. Son ideas y métodos.

**Lo que nunca se copia:** ni una frase de sus textos, ni un dibujo, ni un ejercicio
de sus hojas, ni una pregunta de sus exámenes de muestra. Todo el contenido inglés
de esta app es original y validado contra el syllabus.

Si el profesor pide «meter todas las actividades del libro», eso significa
implementar **los tipos** de actividad con generadores propios, no copiar su
contenido. Díselo con claridad: lo entiende y lo agradece.

## 8. Qué queda pendiente

Por orden de valor:

1. **Las escalas de evaluación de Speaking** del handbook (página 86) como rúbrica,
   para el niño y para el panel del profesor. Hoy Speaking se puntúa por aciertos.
2. **Realinear las páginas del álbum con la tabla temática del PDF** (páginas 38-43).
   Las páginas actuales son razonables pero son mías, no las de Cambridge.
3. **Más contenido**, siempre. Los mínimos están en `checks/11-volume.js`.
4. **Informe imprimible por alumno** para las familias.

## 9. Los PDFs originales

El proyecto se ha construido extrayendo cuatro PDFs oficiales. **No están dentro
del zip**, y hacen falta para regenerar el vocabulario:

| PDF | Para qué |
|---|---|
| `506166-starters-movers-flyers-word-list-2025.pdf` | genera el álbum y el syllabus |
| `357180-starters-movers-and-flyers-handbook-for-teachers-2024.pdf` | formato, puntos, gramática, escalas |
| `476679-cambridge-english-a1-movers-classroom-activities.pdf` | inventario de actividades |
| `758131-a1-movers-wordlist-picture-book.pdf` | inventario de actividades |

Se descargan gratis de la página de preparación de Cambridge. Si vas a tocar el
vocabulario, pídeselos al profesor: los tiene.

Regenerar:

```
python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf
npm run check
```

## 10. Documentos hermanos

- **`CLAUDE.md`** — la regla §0 y las reglas cortas. Léelo al empezar la sesión.
- **`REVIEW.md`** — qué comprueba cada una de las 13 baterías y **por qué**, más
  las instrucciones para añadir un juego, una escena o contenido nuevo.
- **`LEEME.md`** — la guía para el profesor: qué hace cada juego y por qué.
