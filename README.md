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

Son 35 comprobaciones (16 baterías y 19 medidas del trinquete). Si sale **TODO EN
VERDE**, el proyecto está sano y puedes construir encima. Si sale algo rojo, eso es
lo primero que se arregla.

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
| Wordlist oficial | **883 de 883** palabras distintas, todas con cromo y todas ejercitables |
| Páginas del álbum | **24**; las 591 palabras que Cambridge clasifica por tema están en la página que dicta su tabla temática |
| Gramática oficial de Movers | **25 de 25** estructuras |
| Escala de Speaking del handbook | **3 de 3** criterios, bandas 0–5, con la regla de la pronunciación |
| Actividades del libro de aula con juego | **18 de 18** |
| Actividades del picture book con juego | **7 de 7** |
| Tableros del picture book | **8 de 8**, con 155 palabras del wordlist, 32 preguntas y 48 frases |
| Piezas de contenido | **591** |
| Escenas dibujadas | **8**, más 24 viñetas de las historias de Reading 5 |
| Informe imprimible por alumno | las **15** partes, la escala de Speaking y los simulacros |

El PDF del wordlist tiene 894 líneas, pero una misma palabra puede aparecer dos
veces con distinta función (*drive* como verbo y como nombre) y una línea puede
dar dos cromos (*child/children*). El álbum cuenta palabras distintas: 883.

31 juegos: 15 que corresponden a partes del examen y 16 de entrenamiento.
Más un simulacro completo cronometrado con Statement of Results (que se guarda en
el perfil), ocho tableros del picture book y un informe imprimible por alumno.

## 4. Cómo está montado

```
index.html            arranque, sin peticiones externas
package.json          scripts: check, check:update, start
src/
  main.js             rutas: album, tema, juego, tablero, simulacro, perfiles,
                      profesor, informe
  core/               dom, eventos, router, estado, almacenamiento, perfiles,
                      audio (con modo examen) y voz (micrófono)
  data/               syllabus, wordlist, temas, tableros, gramática y el
                      contenido de cada juego, más las escenas dibujadas
  engine/             puntuación, progreso, vocabulario, formas de palabra,
                      números, escala de Speaking, el motor del simulacro y
                      el informe
  games/              registro + una carpeta por juego
  ui/                 barra, álbum, tablero, perfiles, panel del profesor,
                      informe, simulacro, contenedor de juegos y componentes
                      compartidos
  styles/             fuentes, tokens, base, estilos por vista y el de imprimir
  fonts/              woff2 empaquetados (Baloo 2, Atkinson Hyperlegible)
checks/               las 16 comprobaciones, el inventario de actividades de
                      los libros (lib/activities.js) y la línea base del trinquete
tools/                el generador del álbum desde el PDF oficial
```

Cada juego expone `mount(root, ctx)` y devuelve `{ destroy }`. Si `ctx.onFinish`
existe, el juego **entrega su resultado en vez de pintar su pantalla final**: así
funciona el simulacro. Si `ctx.boardId` existe, el juego trabaja solo con las
palabras de ese tablero (lo hacen *Let's talk!*, *What are they doing today?* y
*Word gym*). Añadir un juego no obliga a tocar los demás.

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
- *Word hunt* haciendo de parte 4 de Listening: entrenaba vocabulario ("Where is the
  kite?") cuando el examen son cinco diálogos que nombran las tres opciones y hay que
  escuchar hasta el final. Un niño podía bordarlo y fallar la parte real.
- `fill(caja, [a, b])` mostraba el texto "[object HTMLParagraphElement],…" en vez de los
  botones en doce pantallas (el título de la parte 3 de Reading, las respuestas modelo
  de Speaking…). Lo cazó una prueba que monta las pantallas sin navegador; `mount()`
  acepta listas desde entonces.
- El juego de -ing enseñando *sailling* como respuesta correcta: la regla de doblar
  la l (*travelling*) se aplicaba también tras dos vocales. Lo cazó la prueba del
  pasado simple al reutilizar la misma regla.
- Doce cromos que no eran palabras (`her poss`, `band music`, `No words at this
  level yesterday`) y diez entradas reales sin cromo (`her`, `my`, `yesterday`,
  `band`, `keyboard`…), con la cobertura marcando 100 % contra la lista corrupta
  que el propio extractor había producido. La batería solo puede medir contra lo
  que el extractor le da: por eso `build-wordlist.py` lleva ahora un `--selftest`
  con cada caso que ya falló, y se ejecuta antes de regenerar.

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
- **Las páginas temáticas las dicta la tabla temática del wordlist.** El generador
  la lee del mismo PDF (páginas 38-43) y la comprobación 3 falla si un cromo está
  fuera de las páginas que Cambridge le da. Cuando una palabra está en dos temas
  (*bike*: Sports, Toys y Transport) decide una prioridad fija de lo concreto a lo
  general, con diez excepciones razonadas en `build-wordlist.py`. Las palabras que
  Cambridge no clasifica (*app*, *idea*, *treasure*…) las coloca la app. Los cromos
  que un niño ya tenía siguen a su palabra cuando cambia de página: al cargar el
  perfil, `relocateStickers` (en `engine/progress.js`) los recoloca y retira los de
  palabras que ya no existen.
- **Un icono no puede representar a dos palabras distintas.**
- **El vocabulario no se edita a mano.** Se cambia `tools/build-wordlist.py` y se
  regenera. Los cuatro archivos que genera llevan el aviso en la cabecera.
- **Nada de peticiones externas desde `index.html`.** Las fuentes van empaquetadas.
- **Los datos de cada niño se quedan en su navegador.** No hay servidor ni cuentas.
- **El reconocimiento de voz va apagado por defecto.** Chrome envía el audio a
  Google y son menores. Se enciende a mano y con aviso visible.
- **En el simulacro cada grabación suena dos veces, no tres.**
- **La gramática no resta en la Parte 6.** Lo dice el handbook de Cambridge.
- **Cada parte del examen reproduce la tarea del handbook, no una simplificación.**
  En Listening 4 se escuchan diálogos adulto-niño que nombran las tres opciones y
  cambian de idea; en Listening 1 el adulto se confunde con otra persona del dibujo y
  el niño rectifica; en Speaking 1 y 2 habla primero el niño y el modelo se oye después.
  Los entrenamientos que simplifican (*Word hunt*, *Story order*) siguen, pero como
  entrenamientos.
- **Speaking se puntúa con la escala del handbook** (Vocabulary and grammar,
  Pronunciation, Interaction, de 0 a 5), no por aciertos. En el simulacro el niño se
  evalúa con ella al acabar la prueba de Speaking y eso decide sus escudos; el
  profesor la usa en su panel y su nota manda sobre la del niño. Los aciertos se
  siguen mostrando como información. Con muy poca lengua, la pronunciación no pasa
  de 3, como dice el handbook.
- **Nunca se puntúa a cero por un fallo del reconocimiento de voz.**
- **El informe para las familias solo dice lo que el perfil guarda.** No estima ni
  redondea hacia arriba; la comprobación 16 lo verifica con perfiles de prueba.

## 7. Copyright: dónde está la línea

Esto se ha cuidado desde el principio y hay que seguir cuidándolo.

**Lo que sí se usa del material de Cambridge:**

- El **wordlist** (883 entradas) y la **lista de gramática** (25 estructuras). Son
  el syllabus: lo que hay que aprender, publicado para eso.
- La **estructura del examen**: 15 partes, sus puntos, sus tiempos, sus reglas.
  Son hechos.
- El **inventario de tipos de actividad** de sus libros, y del picture book el
  inventario de escenas con las palabras del wordlist que señala cada una. Son
  ideas, métodos y una lista de palabras ya pública.

**Lo que nunca se copia:** ni una frase de sus textos, ni un dibujo, ni un ejercicio
de sus hojas, ni una pregunta de sus exámenes de muestra. Todo el contenido inglés
de esta app es original y validado contra el syllabus.

Si el profesor pide «meter todas las actividades del libro», eso significa
implementar **los tipos** de actividad con generadores propios, no copiar su
contenido. Díselo con claridad: lo entiende y lo agradece.

## 8. Qué queda pendiente

Por orden de valor:

1. **Más contenido**, siempre. Los mínimos están en `checks/11-volume.js`; las
   partes que más lo agradecen son Reading 6 (4 escenas) y Listening 5 (4 escenas
   de colorear), porque dibujar una escena cuesta más que escribir un texto.
2. **Exportar e importar un perfil** (un archivo), para que un niño pueda seguir en
   otro aparato sin servidor.
3. **Voces**: probar con voces instaladas en las tablets del aula y, si hace falta,
   bajar la velocidad por defecto en `core/audio.js`.

## 9. Los PDFs originales

El proyecto se ha construido extrayendo cuatro PDFs oficiales. **No están dentro
del zip**, y hacen falta para regenerar el vocabulario:

| PDF | Para qué |
|---|---|
| `506166-starters-movers-flyers-word-list-2025.pdf` | genera el álbum (lista A-Z y tabla temática) y el syllabus |
| `357180-starters-movers-and-flyers-handbook-for-teachers-2024.pdf` | formato, puntos, gramática, escalas |
| `476679-cambridge-english-a1-movers-classroom-activities.pdf` | inventario de actividades |
| `758131-a1-movers-wordlist-picture-book.pdf` | inventario de actividades |

Se descargan gratis de la página de preparación de Cambridge. Si vas a tocar el
vocabulario, pídeselos al profesor: los tiene.

Regenerar:

```
python3 tools/build-wordlist.py --selftest
python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf
npm run check
```

Si el `--selftest` falla, el extractor se ha roto y no se regenera nada hasta
arreglarlo. Las grafías US que el PDF da entre paréntesis (*color*, *center*)
valen para el syllabus pero no son entradas: no tienen cromo.

## 10. Documentos hermanos

- **`CLAUDE.md`** — la regla §0 y las reglas cortas. Léelo al empezar la sesión.
- **`REVIEW.md`** — qué comprueba cada una de las 16 baterías y **por qué**, más
  las instrucciones para añadir un juego, una escena, un tablero o contenido nuevo.
- **`LEEME.md`** — la guía para el profesor: qué hace cada juego y por qué.
