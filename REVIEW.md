# REVIEW.md

Lo que hay que comprobar antes de dar por terminado cualquier trabajo en este proyecto.

## La regla

```
npm run check
```

Si sale **TODO EN VERDE**, se puede entregar. Si sale algo rojo, **no se entrega**:
se arregla primero. No hay excepciones y no vale "es un detalle menor".

El comando tarda unos segundos y no necesita internet ni instalar nada. Son 16
baterías más el trinquete: 35 comprobaciones en total.

## Qué comprueba, y por qué cada cosa está ahí

Ninguna de estas dieciséis comprobaciones es teórica. Todas están porque ese error
ya ocurrió de verdad en este proyecto.

**1. Estructura del código.** Imports rotos o sin usar, `console.log` olvidados,
`localStorage` fuera de `core/`, y que `index.html` no pida nada por internet.
*Por qué:* la web tiene que funcionar en un aula sin conexión.

**2. Vocabulario dentro del syllabus.** Cada palabra inglesa que ve u oye un
alumno tiene que estar en las listas de Starters o Movers.
*Por qué:* se colaron `medicine`, `calendar`, `hour`, `sell`, `leave`, `use`,
`visit`, `high`, `hard`, `land`, `warm`, `bench` y `fence`. Todas son de Flyers.
Un niño estudiando palabras que no le van a preguntar es tiempo de clase tirado.
Al escribir contenido nuevo conviene saber que tampoco están `fast`, `far`,
`hear`, `noisy`, `dark`, `tomorrow`, `late`, `winter`, `summer`, `race`, `rope`,
`time`, `way`, `other`, `still` ni `without`: la batería los caza, pero se ahorra
una vuelta.

**3. Álbum completo y coherente.** Cada una de las **883 entradas del wordlist
oficial** tiene su cromo con ese nombre exacto, no hay cromos inventados, ninguna
página está vacía, ningún cromo se repite y **ningún icono lo comparten dos
palabras**.
*Por qué:* durante un tiempo el álbum se midió contra una lista transcrita a mano
por Claude, que se había dejado `catch`, `could`, `café`, `don't worry`, `dad`,
`table`, `wait`, `o'clock` y `a lot of`. Medía 100% contra una referencia
incompleta. Ahora la referencia es `src/data/wordlist-source.js`, extraída del PDF
con `pdftotext`.
También: al ampliar el álbum, `dog` y `puppy` acabaron con el mismo dibujo, y
`tooth`, `teeth`, `dentist` y `toothache` los cuatro con el mismo. Word hunt
enseña cuatro dibujos: si dos son iguales, el niño falla haciéndolo bien.
En septiembre de 2026 se vio que el propio extractor había fabricado doce cromos
que no eran palabras (`her poss`, `band music`, `No words at this level yesterday`)
y dejado sin cromo diez entradas reales (`her`, `my`, `yesterday`, `band`,
`keyboard`…). La cobertura marcaba 100 % contra su propia lista corrupta: esta
comprobación solo puede medir contra lo que el extractor le da. Por eso
`build-wordlist.py` tiene `--selftest` con cada caso que ya falló.
Además, cada cromo que Cambridge clasifica por tema tiene que estar en una de las
páginas que le da su tabla temática (páginas 38-43 del wordlist), que el generador
lee del PDF y escribe en `wordlist-source.js` como `THEMATIC`. El álbum tiene 24
páginas: *More things* desapareció al quedarse sin cromos. El trinquete mide cuántos
cromos están en su página (hoy 591 de 591). *Por qué:* las páginas eran un criterio
propio; ahora son las de Cambridge, y un cromo no puede irse a otra página sin que
la batería lo diga.
La comprobación también prueba `relocateStickers` (`engine/progress.js`): los
cromos guardados por página siguen a su palabra cuando cambia de página, los de
palabras retiradas desaparecen, y la reparación es idempotente. `core/state.js` la
aplica al cargar cada perfil a través de `state.onLoad`, registrado en `main.js`.
*Por qué:* el progreso se guarda como lista de cromos por página; sin esto, al mover
107 palabras los niños verían cromos ganados como bloqueados y contadores de 60/58.

**4. Fidelidad al examen real.** Las 15 partes están cubiertas, ninguna dos veces,
todas listas, y en el orden del examen.
*Por qué:* es el objetivo del proyecto. Si una parte se cae, se cae la nota.

**5. Los generadores nunca crean partidas rotas.** 300 rondas de cada juego
comprobando sus reglas: que Word hunt no repita opciones, que el intruso no
repita fichas, que Match the names no cree dos personas idénticas.
Listening parte 4 (`tickbox`, *Listen and tick*): cada diálogo de `data/tickbox.js`
es adulto-niño, nombra los tres dibujos y la pregunta no se chiva; las rondas dan
cinco diálogos distintos marcados A, B, C. Speaking parte 1: la línea del examinador
describe su dibujo y nunca contiene la diferencia del niño.
*Por qué:* estos fallos aparecen una vez de cada trescientas. Probando a mano no
se ven; en clase con veinte niños, sí.

**6. Los correctores aceptan lo correcto y rechazan lo falso.** Cada respuesta
modelo tiene que puntuar al máximo, y una respuesta falsa no. Speaking parte 2
(`story`, *Tell the story*): contar el dibujo puntúa silencio 0, algo 1, frase con
sentido 2, sobre todas las historias; una frase con sentido pero de otra cosa vale 1.
*Por qué:* es lo peor que puede pasar. Un niño que contesta bien y recibe un
fallo aprende lo contrario de lo que queremos.

**7. Gramática oficial de Movers.** Las **25 estructuras** de la *Grammar and
Structures List* del handbook (páginas 52-53) tienen que aparecer en el contenido.
La lista vive en `src/data/grammar-list.js` con su ejemplo oficial.
*Por qué:* la app llegó a estar escrita entera en presente, sin una sola frase en
pasado. Y cuando se midió contra la lista real en vez de contra una lista de diez
puntos inventada por Claude, salieron 18 de 25: faltaban *shall*, *have got to*,
*what's the matter*, *how about*, *go for a*, los objetos indirectos y
*want someone to do something*.

**8. El simulacro recorre el examen entero.** Las tres pruebas encadenan las 15
partes sin atascarse, los tiempos son los oficiales (25, 30 y 7 minutos), al
acabarse el reloj lo que falta cuenta cero, y **todos los juegos saben entregar
su resultado** en vez de pintar su propia pantalla final. La lista de
entrenamientos que no entran en el simulacro no está escrita a mano: sale de
`PRACTICE` en el registro.
*Por qué:* si alguien añade un juego y se olvida de `ctx.onFinish`, el simulacro
se queda colgado en esa parte y no se nota hasta que un niño lo prueba.

**9. Todo el wordlist se puede practicar.** Las 883 entradas llegan al motor de
vocabulario y cada una produce una pregunta válida. Los tres tipos de ejercicio
siguen existiendo y el corrector acepta la respuesta correcta de cada palabra.
*Por qué:* el álbum enseñaba las 883 palabras pero los ejercicios solo tocaban
unas 300. Las que no se dibujan (adjetivos, verbos, preposiciones) no se
practicaban en ninguna parte.

**10. Las actividades del libro de aula tienen juego.** Las formas en -ly y en
-ing se generan bien (20 casos difíciles comprobados uno a uno), los distractores
son siempre tres, y en Yes or no **ninguna frase marcada como falsa puede ser
cierta en el modelo de la escena**.
*Por qué:* el generador de Yes or no llegó a decir que «The dog is in the garden»
era falso, cuando el perro sí estaba en el jardín. Usaba lugares genéricos como
respuesta falsa. Una actividad que castiga al niño por acertar es peor que no
tenerla.
Las 18 actividades del cuadernillo (6 worksheets × A, B, C) están inventariadas en
`checks/lib/activities.js`, cada una con el juego que la implementa o con
`games: []` si todavía no hay ninguno. La comprobación verifica que cada juego
citado existe y está dado de alta, y el número del trinquete es cuántas tienen
juego: hoy 18 de 18. *Por qué:* el "10 tipos de actividad" anterior era
`PRACTICE.length + 1`; contaba entrenamientos, no cobertura del libro, y no podía
decir qué faltaba.
Cinco entrenamientos implementan actividades del cuadernillo que no tenían juego:
*What did you do yesterday?* (`pastform`: pasado simple, regla ortográfica más
tabla de irregulares en `engine/wordforms.js`, una frase por verbo en
`data/past-forms.js`), *Word pairs* (`wordpairs`: las 24 palabras compuestas del
wordlist, derivadas, no escritas), *A busy day* (`timeprep`: at/in/on/before/after
con horas que tienen sentido), *What's the matter?* (`matter`: el dibujo de una
parte del cuerpo y *My … hurts*, diez partes con dibujo claro) y *Where are they?*
(`whereare`: alguien dice lo que está haciendo y el niño escribe el lugar, 22
lugares del wordlist en `data/where-are-they.js`). La comprobación recorre 200
rondas de cada uno: opciones distintas, respuesta presente, frase que no se chiva,
corrector que acepta la buena y rechaza la mala, compuestas sin doble respuesta,
en antes/después que el número de la hora que ve el niño no lleve a la respuesta
contraria, partes con dibujo, lugares que son entradas, pistas únicas que no
nombran el lugar entero y bancos de ocho con la respuesta dentro. También vigila
que *sail* dé *sailing*: la regla de doblar la l (*travelling*) daba *sailling*.

**11. Hay contenido para un curso.** Cada parte del examen tiene un mínimo de
piezas distintas, para que un niño no repita el mismo texto antes de un trimestre.
Los mínimos de las partes que iban más justas subieron en octubre de 2026: 10
diálogos de Reading 2, 10 historias con huecos de Reading 3, 10 textos de
Reading 4 y 8 historias de Reading 5, más los ocho tableros con sus 32 preguntas
y 48 frases.
*Por qué:* con 2 diálogos y 2 historias, en tres semanas se los saben de memoria y
dejan de practicar para pasar a recordar.

**12. Las escenas dibujadas cumplen sus reglas.** En las de colorear, los objetos
del SVG coinciden con la lista, hay cartel para la pregunta de escribir, y **cada
familia tiene al menos dos objetos**. En las de la Parte 6, la suma da 10 puntos,
las piezas existen, nada queda fuera del lienzo y hay al menos cuatro objetos con
color. Las viñetas de las historias de Reading 5 pasan por lo mismo: fondo y piezas
que existen, dentro del lienzo, y un dibujo que se genera entero.
*Por qué:* si una familia tiene un solo objeto, el niño lo identifica sin escuchar
la posición y la parte 5 de Listening deja de entrenar lo que entrena. Y si una
escena describe algo con una palabra de Flyers, se le pide colorear algo que no
sabe nombrar.

**13. Las siete actividades del picture book tienen juego.** Los números del 21 al
100 y los ordinales del 1.º al 20.º se generan bien y en vocabulario del syllabus;
las parejas de contrarios están las dos en la lista; en la sopa de letras cada
palabra está donde dice y se puede encontrar tocando; las frases con banco no se
chivan y su objetivo tiene dibujo; y el corrector de frases puntúa el modelo y
rechaza el vacío. El *Let's talk!* de cada escena cuenta como séptima actividad
(`talkpicture`). El inventario está en `checks/lib/activities.js`; la página de
colorear a los personajes no es un ejercicio y no se cuenta.
*Por qué:* eran los tipos de actividad del picture book que la app no tenía.
Los números eran además la única parte del syllabus que seguía floja.

**14. La escala de Speaking sigue el handbook.** La escala de Speaking de A1 Movers
(handbook, p. 86) vive en `data/speaking-scale.js`: tres criterios con los nombres
y aspectos del handbook (Vocabulary and grammar: Range, Control, Extent, Cohesion;
Pronunciation: Individual sounds, Stress, Intonation; Interaction:
Reception/Responding, Support required, Fluency/Promptness), bandas de 0 a 5 con la
5, la 3 y la 1 descritas con palabras propias, y la regla de que con muy poca
lengua la pronunciación no pasa de 3. `engine/speakingScale.js` suma las bandas y
las convierte en escudos como cualquier otra prueba (15 de 15 → 5), guarda por
alumno la autoevaluación del niño y la nota del profesor, y hace que la del
profesor mande. La comprobación verifica todo eso con mutaciones cubiertas, y que
en el simulacro, con autoevaluación, los escudos de Speaking salgan de la escala
sin perder los aciertos.
*Por qué:* en el examen real no hay aciertos en Speaking, hay una escala; puntuar
por aciertos daba escudos que no se parecían a los del examen.

**15. Los ocho tableros del picture book están completos y se pueden jugar.** Cada
lámina del picture book es un tablero en `data/boards.js`: sus palabras son
entradas del wordlist (al menos 12, sin repetir, al menos 6 con dibujo), el texto
que la presenta tiene tres frases o más y usa las palabras del tablero, hay
exactamente cuatro preguntas de *Let's talk!* con buena respuesta y pista, y al
menos cinco frases con hueco cuya palabra es del tablero, tiene dibujo, no se
repite, no comparte dibujo con otra y no se regala en la frase. Después prueba los
tres juegos en modo tablero: *What are they doing today?* da seis frases del tablero
y un banco de ocho dibujos distintos con la respuesta dentro; el Word gym solo
pregunta palabras del tablero; y la buena respuesta de cada pregunta de *Let's
talk!* pasa su propio filtro mientras una respuesta vacía o sin sentido no lo pasa.
*Por qué:* el picture book es la mitad del material de Cambridge para Movers y la
app lo cubría solo por tipos de actividad. Y un tablero con una palabra fuera del
wordlist, o con dos tarjetas con el mismo dibujo, vuelve a ser el niño fallando
haciéndolo bien.

**16. El informe para las familias dice la verdad del perfil.** `engine/report.js`
reúne lo que ya guarda cada alumno y la comprobación verifica que llega entero: un
perfil nuevo sale a cero sin inventar nada; cinco escudos aparecen como *Ready*,
tres como *Nearly there* y menos como *Needs practice*; lo que practicar propone
primero lo jugado y flojo y nunca una parte lista; una palabra dominada cuenta en
el total y en su página; la nota de Speaking del profesor llega con su comentario;
el Statement of Results de cada simulacro terminado se guarda con sus tres pruebas y
solo se conservan los diez últimos; y pedir el informe de otro alumno no cambia el
perfil activo.
*Por qué:* el informe se imprime y se lleva a casa. Un número que no es el del niño
es peor que no dar informe.

## El trinquete: nada puede retroceder

`checks/baseline.json` guarda los números conseguidos: páginas, cromos, cobertura,
partes cubiertas, puntos, estructuras gramaticales, actividades con juego, piezas
de contenido, escenas, criterios de Speaking, tableros, palabras en tableros y
partes en el informe.

**Si alguno baja, la comprobación falla.** Da igual que todo lo demás esté verde.
Esto es lo que impide perder por el camino algo que ya funcionaba.

Cuando algo mejora de verdad, se sube la marca:

```
npm run check:update
```

Solo se hace **después** de tener todo en verde, y siempre a propósito. Actualizar
la línea base para tapar un retroceso es hacerse trampas al solitario.

## Sobre el material de Cambridge

Del libro de actividades de aula y del picture book se extrajo **el inventario**:
qué tipos de actividad hay y, en el picture book, qué escenas hay y qué palabras
del wordlist señala cada una. No su contenido. Las frases, los textos y los
dibujos de los libros tienen autor y copyright, y están publicados para usarlos
como fichas en clase, no para republicarlos dentro de un programa.

Cada tipo de actividad está implementado con un **generador original** que trabaja
sobre el wordlist. Eso además rinde más: el libro trae 6 hojas fijas, y estos
generadores producen ejercicios distintos cada vez. Los textos, preguntas y frases
de los tableros, los diálogos, las historias y los textos de gramática son
originales y pasan la comprobación 2.

## El vocabulario NO se edita a mano

`src/data/wordlist.js`, `src/data/topics.js`, `src/data/syllabus.js` y
`src/data/wordlist-source.js` están **generados desde el PDF oficial**. Editarlos a
mano es cómo se rompió antes.

Si hace falta cambiar algo (un icono, un tema), se cambia el generador y se vuelve
a generar:

```
python3 tools/build-wordlist.py --selftest
python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf
npm run check
```

Si el `--selftest` falla, no se regenera nada hasta arreglar el extractor. Las
grafías US entre paréntesis (*color*, *center*, *favorite*) cuentan para el
syllabus pero no son entradas del wordlist y no tienen cromo. La regla de
desempate para palabras que Cambridge pone en dos temas y sus diez excepciones
están en `THEME_PRIORITY` y `THEME_EXCEPTIONS` de `build-wordlist.py`; el
`--selftest` las repasa (31 casos en total).

El PDF no está en el repositorio; se descarga gratis de la web de Cambridge o se
lo pides al profesor. La comprobación 3 falla si aparece un cromo que no está en el
PDF o si falta alguna entrada.

## Al añadir contenido nuevo

Si añades un juego con textos en inglés, tienes que darlo de alta en
`checks/lib/content.js`. Si no, su vocabulario no se revisa y volverán a colarse
palabras de Flyers. Los textos para el profesor o las familias (panel, informe,
descripciones de los juegos) no son contenido para el niño y no se registran.

Formas de cada pieza, que la comprobación 6 vigila: un diálogo tiene 6 turnos con
3 opciones y un `why`; un texto de Reading 4 tiene 5 huecos con 3 opciones y un
`why`, y 6 trozos; una historia de Reading 3 tiene 5 respuestas, banco de 9, 3
títulos y 6 trozos; una historia de Reading 5 tiene 3 secciones con `art` y 7
preguntas cuya respuesta (1 a 3 palabras) está en el texto.

## Al dibujar una escena nueva

**De colorear** (`src/data/scenes/`, dar de alta en `scenes/index.js`):
- Ocho objetos en tres familias, y ninguna familia con un solo miembro.
- Cada objeto en un `<g class="paintable" data-obj="id">` con sus formas `fillable`.
- Un `<text id="sign-text">` vacío para la pregunta de escribir.
- Las frases de posición, solo con vocabulario del syllabus. Nada de *bench*,
  *fence*, *wheel* ni *seaside*: son de Flyers.

**De la Parte 6** (`scenes/part6.js`): se componen con las piezas de `pieces.js`.
Necesitan el modelo `entities` con color, acción y sitio, seis `prompts` que sumen
10 puntos, y al menos cuatro objetos con color para que Yes or no funcione.

**Viñetas de Reading 5** (`reading-stories.js`): `art: { bg, items }` con un fondo
de `BACKGROUNDS` y piezas de `PIECES` (`person` admite `shirt`, `hair`, `tall` y
`mood`; hay `box`, `camera`, `duck`, `goat`, `car`, `bike`…). Si falta una pieza,
se añade a `pieces.js` dibujada alrededor del origen con los pies en y = 0.

## Al añadir un tablero

Un tablero (`src/data/boards.js`) es una lámina del picture book: `words`
(entradas del wordlist), `intro`, cuatro `talk` (`say`, `expect`, `model`,
`hint`) y seis `gaps` (`target`, `text` con `___`). `expect` puede ser una lista
de palabras o el nombre de un grupo de `EXPECT` (`data/personal-questions.js`);
las palabras del tablero cuentan siempre y una lista vacía admite cualquier
respuesta. Los textos se registran solos en `checks/lib/content.js` porque lee
`BOARDS`. Los juegos que saben jugar con un tablero están en `BOARD_GAMES` del
mismo archivo y reciben `ctx.boardId`.

## Al añadir un juego nuevo

- Darlo de alta en `src/games/registry.js` con su `tag` de parte del examen.
- Añadirlo a la prueba que le toque en `PAPERS`, en `src/engine/mock.js`.
- **En su `finish()`, entregar el resultado con `ctx.onFinish`** antes de pintar
  nada. Sin eso el simulacro se cuelga.
- Añadir su parte a la lista `EXAM` de `checks/04-exam.js` con sus puntos reales.
- Añadir sus invariantes a `checks/05-generators.js`.
- Añadir sus respuestas modelo a `checks/06-checkers.js`.
- Si implementa una actividad de los libros de Cambridge, apuntar su id en
  `checks/lib/activities.js`. Es lo que hace subir la cobertura medida; sin eso el
  juego existe pero el trinquete no se entera.
- Los juegos de elección múltiple pueden apoyarse en `ui/components/miniGame.js`
  (`chooser`, que admite `explain(q)` para mostrar la regla aplicada tras cada
  respuesta); los de escribir una palabra con banco, en `ui/components/writer.js`
  (`speller`).
- Un juego de Speaking no cambia nada de la escala; la autoevaluación se hace una
  vez al acabar la prueba entera en el simulacro.
- Si el juego puede jugarse con las palabras de un tablero, que lea `ctx.boardId`
  y se apunte en `BOARD_GAMES` (`data/boards.js`). `ui/gameHost.js` pasa al juego
  todo lo que llega en `extra` (`renderGame(container, gameId, topicId, extra)`),
  y `back` decide a dónde vuelve el botón de salir.
- Si el juego es una parte del examen, su consejo para casa va en `HOME_TIPS`
  (`engine/report.js`); la comprobación 16 exige uno por parte.

## Cómo está montado, lo que no es obvio

- `fill(caja, [a, b])` y `fill(caja, a, b)` son equivalentes: `mount()` en
  `core/dom.js` aplana listas. Doce pantallas le pasaban listas y el navegador las
  convertía en texto.
- `speakLines([{ who: 'adult' | 'child', text }])` en `core/audio.js` dice un
  diálogo línea a línea con dos tonos, como las dos voces de las grabaciones.
- `state.activeProfile()` dice qué perfil está cargado. Quien cambie de perfil para
  leer otro (panel del profesor, informe) vuelve con eso, no con
  `profiles.currentId()`, que puede no coincidir.
- Los simulacros terminados se guardan en el perfil (`mocks`, los diez últimos)
  desde `saveMock` en `engine/report.js`; el informe los enseña.

## Cosas que ya se decidieron y no hay que rehacer

- **La web no pide nada por internet.** Fuentes empaquetadas en `src/fonts/`.
- **El reconocimiento de voz va apagado por defecto.** Chrome envía la voz a
  Google, y son menores. Se enciende a mano y con aviso visible.
- **La gramática no resta en la Parte 6.** Lo dice el handbook. El corrector no
  la comprueba y no debe empezar a hacerlo.
- **Nunca se puntúa a cero por un fallo del reconocimiento de voz.**
- **En el simulacro cada audio suena dos veces, no tres.** Es la condición del
  examen real y el motivo de que exista el modo examen en `core/audio.js`.
- **En el simulacro no se dice si una respuesta está bien hasta el final.**
- **Un cromo se gana dominando la palabra**, no jugando. Dos aciertos y el último
  intento bien. Antes se desbloqueaban por orden de lista, lo cual premiaba jugar
  en vez de aprender.
- **Nada del material de Cambridge se copia.** El vocabulario y las estructuras
  vienen del syllabus público; los textos, escenas, tableros y actividades son
  originales.
- **El informe se imprime sin depender de los fondos.** Los escudos ganados llevan
  el borde grueso y piden `print-color-adjust: exact`; las impresoras suelen
  quitar los fondos y el informe tiene que seguir leyéndose.
