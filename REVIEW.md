# REVIEW.md

Lo que hay que comprobar antes de dar por terminado cualquier trabajo en este proyecto.

## La regla

```
npm run check
```

Si sale **TODO EN VERDE**, se puede entregar. Si sale algo rojo, **no se entrega**:
se arregla primero. No hay excepciones y no vale "es un detalle menor".

El comando tarda unos segundos y no necesita internet ni instalar nada. Son 22
baterías más el trinquete (21 medidas): 43 comprobaciones en total.

Dos reglas del propio revisor (`checks/run.js`): **escribir un error en la consola
durante la revisión cuenta como fallo** (la app no lanza hacia fuera algunos errores,
como un aviso que falla o un juego que no arranca, y así no pasan desapercibidos), y
cada navegador de prueba deja los avisos de `core/events.js` como estaban al
desinstalarse (`checkpoint()`), para que una comprobación no herede lo que dejó
escuchando otra.

## Qué comprueba, y por qué cada cosa está ahí

Ninguna de estas veintiuna comprobaciones es teórica. Todas están porque ese error
ya ocurrió de verdad en este proyecto.

**1. Estructura del código.** Imports rotos o sin usar, `console.log` olvidados,
`localStorage` fuera de `core/`, y que `index.html` no pida nada por internet.
*Por qué:* la web tiene que funcionar en un aula sin conexión.

**2. Vocabulario dentro del syllabus.** Cada palabra inglesa que ve u oye un
alumno tiene que estar en las listas de Starters o Movers. Incluye las instrucciones
y el guion de Listening del examen para imprimir de varios números, que es también
lo que dicen *Match the names* y *Listen and colour* (así salió `sign`, que no es de
Movers, en la frase de dónde se escribe la palabra), los títulos que se ven (de los
diálogos, las historias, los textos y los formularios: así salieron `plan` y `rainy`)
y el guion del examinador del Speaking cara a cara.
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
El dictado de letras y números (`letters`, *Letters and numbers*): lo que se
deletrea son nombres del wordlist y palabras de la página, todo del syllabus, y se
dicta letra a letra (J-I-L-L); cada partida trae seis deletreos y cuatro números sin
repetir, con al menos dos parejas como 14 y 40; cada número va en una frase en la
que tiene sentido (nadie tiene una abuela de 14 años); y lo que el niño falla sale
más: una letra muy fallada sale bastante más que sin historial, y una pareja que se
acaba de confundir vuelve en la misma partida.
El examen para imprimir (`engine/printTest.js`): con el mismo número sale siempre el
mismo examen, `Math.random` vuelve a ser el de siempre al acabar, cada parte trae lo
que trae el examen de verdad (25 puntos de Listening y 39 de Reading and Writing),
las respuestas casan con las preguntas (cada letra de Listening 3 tiene su dibujo,
la respuesta de Listening 4 está entre los tres, las de Reading 3 están en la caja) y
ninguna respuesta sale vacía; un número de examen raro en la dirección no se acepta.
En el intruso, ningún conjunto tiene dos cosas con el mismo dibujo (salieron el brazo
y el hombro, y el río y el lago), hay de sobra que se entienden solo con dibujos y el
Speaking cara a cara solo usa esos.
*Por qué:* estos fallos aparecen una vez de cada trescientas. Probando a mano no
se ven; en clase con veinte niños, sí.

**6. Los correctores aceptan lo correcto y rechazan lo falso.** Cada respuesta
modelo tiene que puntuar al máximo, y una respuesta falsa no. Speaking parte 2
(`story`, *Tell the story*): contar el dibujo puntúa silencio 0, algo 1, frase con
sentido 2, sobre todas las historias; una frase con sentido pero de otra cosa vale 1.
En la Parte 6, las frases como las escribe un niño: «The boy's T-shirt is green» y
«The boy has got a green T-shirt» valen 2 y con el color equivocado no; «The ducks
are yellow» vale 2. Y *Let's talk!* sobre una escena: sus preguntas y respuestas
modelo usan el syllabus, la respuesta modelo contesta lo que pregunta, y nunca dicen
de una persona que «is green», ni preguntan si te gusta una persona, ni dejan
«flying» sin «a kite», ni hablan de uno cuando hay varios.
En el dictado de letras y números, cada nombre se acepta escrito como lo haría un
niño («jill», «JILL», «J-I-L-L»); «Gill» por Jill dice que va J y no G, «iva» por Eva
que va E y no I, «Jil» que falta la segunda L; «cat» por Jill no se apunta como
letras mal oídas (no se parece: no dice qué letra confunde); los números del 13 al
100 se aceptan en cifras y en letra, y 40 por 14 (o «forty») se reconoce como la
pareja, pero 54 por 45 no.
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
acabarse el reloj lo que falta cuenta cero **y la prueba sigue contando sobre sus
25 o 39 notas** (dos partes perfectas y el resto sin hacer son 10 de 25, no 10 de
10), y **todos los juegos saben entregar su resultado** en vez de pintar su propia
pantalla final. Las pruebas enteras pasan a escudos con la **tabla de Cambridge**
(`data/shield-table.js`): se comprueba nota a nota en los cortes (Listening 21 → 5,
20 → 4, 17 → 3, 13 → 2, 10 → 1; Reading and Writing 33 → 5, 32 → 4, 28 → 3, 23 → 2,
20 → 2, 17 → 1), con los ejemplos que Cambridge escribe con palabras incluidos; y
en proporción, para partes y juegos, los escudos nunca bajan al acertar más, todo
bien son 5 y nada bien es 1. La lista de entrenamientos que no entran en el
simulacro no está escrita a mano: sale de `PRACTICE` en el registro.
*Por qué:* si alguien añade un juego y se olvida de `ctx.onFinish`, el simulacro
se queda colgado en esa parte y no se nota hasta que un niño lo prueba. Y unos
escudos que no son los del examen engañan al niño y a la familia justo en lo que
más les importa.

**9. Todo el wordlist se puede practicar.** Las 883 entradas llegan al motor de
vocabulario y cada una produce una pregunta válida. Los tres tipos de ejercicio
siguen existiendo y el corrector acepta la respuesta correcta de cada palabra. El
repaso espaciado sube un escalón por día: tres aciertos la misma tarde suben uno,
el acierto de otro día sube otro y un fallo lo reinicia; y una ronda no mete más
palabras nuevas de `NEW_PER_ROUND`, sin dejar fuera las falladas.
*Por qué:* el álbum enseñaba las 883 palabras pero los ejercicios solo tocaban
unas 300. Las que no se dibujan (adjetivos, verbos, preposiciones) no se
practicaban en ninguna parte. Y un repaso que sube con aciertos del mismo día manda
a la semana siguiente palabras que solo estaban en la memoria de unos minutos.

**10. Las actividades del libro de aula tienen juego.** Las formas en -ly y en
-ing se generan bien (20 casos difíciles comprobados uno a uno), los distractores
son siempre tres, y en Yes or no **cada frase se mira contra el modelo de la
escena**: lo que marca como cierto lo es y lo que marca como falso también (cada
frase lleva `about`: de quién habla, de qué y con qué). Además tiene que sonar a
inglés de verdad: de una persona se dice el color de su camiseta («The boy's T-shirt
is green»), lo que hay varias veces va en plural («The ducks are swimming»; si son
de colores distintos, «One book is blue») y lo que hace lleva su complemento
(«flying a kite»).
*Por qué:* el generador de Yes or no llegó a decir que «The dog is in the garden»
era falso, cuando el perro sí estaba en el jardín. Usaba lugares genéricos como
respuesta falsa. Una actividad que castiga al niño por acertar es peor que no
tenerla. En noviembre de 2026, mirando las frases que salían, aparecieron «The girl
is flying» (era una cometa), «The boy is green» (su camiseta) y «Yes, I like the
boy because it is green».
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
Los mínimos subieron en octubre de 2026: 16 diálogos de Reading 2, 16 historias
con huecos de Reading 3, 16 textos de Reading 4, 12 historias de Reading 5, 8
escenas de la Parte 6 (10 desde noviembre), 12 formularios de Listening 2, 10 juegos de emparejar de
Listening 3, 24 diálogos de Listening 4, 6 escenas de colorear y 12 historias de
Speaking 2, más los ocho tableros con sus 32 preguntas y 48 frases.
*Por qué:* con 2 diálogos y 2 historias, en tres semanas se los saben de memoria y
dejan de practicar para pasar a recordar.

**12. Las escenas dibujadas cumplen sus reglas.** En las de colorear, los objetos
del SVG coinciden con la lista, hay cartel para la pregunta de escribir, y **cada
familia tiene al menos dos objetos**; además el SVG se lee de verdad con el DOM de
prueba: un grupo por objeto, cada uno con algo que pintar (que empieza en blanco),
un solo cartel y una descripción para el lector de pantalla. Cada pieza de dibujo se
pinta entera, con y sin color, y cada persona en todas sus variantes. En las de la Parte 6, la suma da 10 puntos,
las piezas existen, nada queda fuera del lienzo y hay al menos cuatro objetos con
color; lo que se dibuja más de una vez dice su `plural`, y una acción que sin
complemento cambia de sentido (*flying*, *riding*) lleva `doing`. Las viñetas de las historias de Reading 5 y de Speaking 2 pasan por lo mismo:
fondo y piezas que existen, dentro del lienzo, y un dibujo que se genera entero; en
Speaking 2, además, cuatro viñetas y solo la primera contada por el examinador. Cada
persona dibujada dice quién es (`who`: niño, niña, hombre o mujer), también quien va
montado en una bici. Cada `url(#…)` de cada dibujo (viñetas, Parte 6, colorear,
*Match the names* y *Find the differences*) apunta a un degradado que está en ese
mismo dibujo; la cuerda de cada cometa sale de la mano en alto de alguien; y el perro
de la Parte 6 está sentado, corriendo o de pie según lo que digan sus frases.
*Por qué:* si una familia tiene un solo objeto, el niño lo identifica sin escuchar
la posición y la parte 5 de Listening deja de entrenar lo que entrena. Y si una
escena describe algo con una palabra de Flyers, se le pide colorear algo que no
sabe nombrar. Un degradado que falta pinta una forma de negro o no la pinta; una
cuerda que flota o un perro de pie en «The dog is sitting» hacen que el dibujo
diga otra cosa que la frase.

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
lengua la pronunciación no pasa de 3. `engine/speakingScale.js` convierte las
bandas en escudos con la banda media de las tres, hacia abajo y como mínimo 1 (banda
5 en todo → 5; banda 2 en todo → 2): Speaking no tiene tabla de notas, así que no usa
la de Listening ni la de Reading and Writing. Guarda por
alumno la autoevaluación del niño y la nota del profesor, y hace que la del
profesor mande. La comprobación verifica todo eso con mutaciones cubiertas, y que
en el simulacro, con autoevaluación, los escudos de Speaking salgan de la escala
sin perder los aciertos.
El Speaking cara a cara (`engine/examiner.js`) sigue el examen: en la parte 1 el
examinador dice un ejemplo con los dos dibujos y pregunta cuatro diferencias, cada
una con su línea y su respuesta distintas; en la parte 2 cuenta el título y el primer
dibujo y el niño los otros tres; en la parte 3 hay cuatro conjuntos (el primero de
ejemplo) y la respuesta modelo de cada uno dice cuál es y por qué; en la parte 4, cinco
preguntas distintas sin repetir el nombre.
*Por qué:* en el examen real no hay aciertos en Speaking, hay una escala; puntuar
por aciertos daba escudos que no se parecían a los del examen. Y hay una persona
delante: el examinador.

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
solo se conservan los diez últimos; lo que el niño confunde al oído en el dictado
(letras, y parejas como 14 y 40) llega al informe, pero un despiste suelto no; los
exámenes en papel llegan en orden de fecha, con la última nota de cada prueba y lo
que falta para los 5 escudos, y ese «lo que falta» se comprueba nota a nota contra
la tabla de Cambridge (de 0 a 25 y de 0 a 39); y pedir el informe de otro alumno
no cambia el perfil activo.
*Por qué:* el informe se imprime y se lleva a casa. Un número que no es el del niño
es peor que no dar informe.

**17. Todas las pantallas se abren y todos los juegos se juegan enteros.** Monta la
app en un navegador de prueba hecho a mano (`checks/lib/dom.js` y
`checks/lib/browser.js`: documento, reloj que avanza cuando la prueba quiere, azar
con semilla, voz de síntesis falsa que tarda lo que tardaría una real) y un niño de
prueba (`checks/lib/bot.js`) juega **cada juego de principio a fin**: en práctica y en
examen, con voz y sin voz, y los de tablero. Comprueba que el resultado llega una
sola vez y con los puntos de esa parte del examen, que la pantalla final no enseña
`undefined` ni `[object …]`, que «jugar otra vez» vuelve a empezar, que ningún botón
se queda sin nombre para un lector de pantalla y que `destroy()` no deja nada roto.
Contesta además una vez **con el teclado** en cada juego: tras repintar, el foco
tiene que seguir dentro del juego. Después arranca `main.js` y recorre todas las
rutas (incluidas una desconocida y una mal escrita, y el examen para imprimir, que
tiene que traer las cinco partes de Listening, las seis de Reading and Writing, el
guion y las respuestas; sin número se queda con uno en la dirección): cada pantalla
tiene que poner su nombre en la pestaña y llevar el foco al contenido. El Speaking
cara a cara se hace entero tocando botones, como el profesor: empezar, las cuatro
partes, las tres bandas y guardar; la nota tiene que llegar al álbum del niño. Hace un simulacro entero
tocando botones y otro en el que se acaba el reloj, y después lo que se deja a
medias: un simulacro abandonado se para entero (ni reloj, ni resultados encima de
otra pantalla, ni modo examen en la práctica), un juego que termina de cargar
después de volver no se pinta encima del álbum, y si se borra al niño que juega la
app pregunta quién juega (quien juega y el álbum cargado siempre coinciden). Mira
también que Ajustes deja de escuchar sus avisos al salir (cuenta los oyentes con
`listenerCount()`), que al repintar el foco vuelve al mismo botón si sigue, y que
el plan del día solo se tacha en la página o el tablero que propone.
En el simulacro (los quince juegos del examen con `exam`), después de cada toque se
mira la pantalla: nada puede decir si una respuesta está bien (colores de acierto o
fallo, la respuesta buena resaltada, la sacudida, los avisos verdes o rojos ni la nota
que va sumando).
*Por qué:* la pantalla final de *Listen and colour* rompía con un error y nadie lo
vio porque ninguna prueba llegaba a jugar la partida entera. El trinquete guarda
cuántas partidas se juegan (122).

**18. La voz dice los diálogos enteros y no se cuelga.** `core/audio.js` con una voz
falsa: un diálogo suena en orden, con dos tonos, y avisa al acabar una sola vez;
repetirlo no mezcla dos; si el navegador pierde el aviso de «terminé» (pasa en
Chrome), el reloj de seguridad sigue; los textos largos se parten por frases; parar
no avisa; sin sonido no suena nada; velocidad de práctica y de examen; elegir voz y
volver a la inglesa por defecto. Y la **privacidad**: el reconocimiento de voz está
apagado por defecto, encenderlo enseña el aviso en todas las pantallas que escuchan
(y en la barra, con «Turn it off»), al salir de la pantalla el micrófono se suelta,
tocar dos veces mientras se pide permiso no deja una grabación huérfana, y la
grabación propia se puede escuchar y luego se libera. Apagar el reconocimiento
mientras escucha lo corta en ese momento y tira lo oído (si no, la voz seguía
saliendo del aparato con el aviso ya quitado); si grabar falla, el micrófono se
apaga; parar una grabación no se cuelga aunque el navegador no avise.
La voz del profesor (`core/recordings.js`): una frase grabada suena con su grabación
en vez de la voz del navegador, en su sitio dentro de un diálogo, un poco más lenta
en el modo lento y a su velocidad en el simulacro; cortada no avisa de que terminó;
rota, se dice con la voz del navegador; sin sonido no suena; la misma frase con otro
apóstrofo usa la misma grabación. El archivo para otras tablets vuelve igual byte a
byte, abrirlo dos veces no repite nada y lo que no es un archivo de grabaciones se
rechaza con un mensaje. Las frases que se ofrecen para grabar son exactamente las que
dice la app (los nombres deletreados, las letras y las instrucciones del examen
impreso se comparan con el código que las dice). Y la pantalla *Your voice* graba de
verdad con un micrófono de prueba, guarda, cuenta y no deja el micrófono abierto al
salir.
*Por qué:* *Tell the story* reconocía la voz sin aviso, el micrófono seguía abierto
al salir, y en tablets reales los diálogos se quedaban colgados a mitad.

**19. La web se instala y funciona sin internet.** `precache-list.js` coincide con lo
que generaría `tools/build-precache.mjs` (todos los archivos que usa la app, cada
módulo que se importa, y una versión que es el resumen de sus contenidos); ejecuta
`sw.js` en una máquina virtual con cachés y red falsas: instala, sirve la web sin
red (también rutas con parámetros), instala una versión nueva aparte, espera a que
se le diga y borra la vieja; si falla un archivo, la instalación no queda a medias.
La versión nueva se guarda con archivos pedidos a la red de verdad
(`cache: 'reload'`), no con copias viejas de la caché del navegador, y un
`index.html` que el servidor redirige se sirve limpio. Comprueba el manifest y sus
iconos, los enlaces de `index.html`, y que `core/offline.js` registra `./sw.js` con
`updateViaCache: 'none'` y no lo hace en `localhost` (taparía los cambios mientras
se programa). Y prueba en una web de juguete `build-precache.mjs --check` y el
gancho opcional `tools/hooks/pre-commit`.
*Por qué:* la web sin internet no veía las versiones nuevas porque el navegador
guardaba la lista de archivos en su caché. Probado después en un Chromium real.

**20. El progreso de los niños no se pierde (copias y fechas).** La copia de un
alumno y la de la clase (`engine/backup.js`) se restauran tal cual; restaurar dos
veces no cambia nada; juntar con lo que ya hay se queda con lo mejor de cada lado
(cromos de los dos, mejor escudo, por palabra el máximo de aciertos y la fecha más
reciente, la racha del último día jugado, de cada letra o número que se confunde al
oído la mayor cuenta, los exámenes en papel de los dos lados sin repetir, de cada
error del cuaderno el intento más reciente, y el día en que subió el repaso de cada
palabra) y da lo mismo el orden; un error acertado en dos días, uno en cada tablet,
sale del cuaderno al juntar; un archivo que no
es una copia, roto o con datos sin sentido se rechaza con un mensaje que se entiende
o se limpia; un alumno borrado y vuelto a crear no hereda datos viejos; los botones
del panel del profesor descargan y restauran de verdad, y el formulario de los
exámenes en papel no deja guardar 26 sobre 25, enseña los escudos antes de guardar
y guarda en el álbum del alumno elegido (una nota imposible de un archivo tocado a
mano no entra, pero el resto de ese examen sí). Nombres raros en una copia
(`toString`, `__proto__`) no la rompen, los repetidos de verdad (dos grabaciones
iguales de Speaking) se conservan y el plan del día viaja. Con el aparato lleno, lo
último guardado se sigue leyendo, y una restauración que no cabe lo dice en vez de
fingir que salió bien. Y las fechas: en Lima por la tarde (UTC ya es mañana) el día
y la racha son los locales.
*Por qué:* las fechas en UTC rompían la racha de quien jugaba por la tarde, y sin
copias un niño que cambia de tablet lo pierde todo.

**21. El plan del día elige con sentido y se tacha al jugar.** `engine/plan.js`: un
alumno nuevo recibe palabras de la primera página, la primera parte del examen y un
tablero; el plan no cambia durante el día aunque cambie el progreso; al día
siguiente propone la página con más palabras falladas y la parte más floja; se
tacha al terminar el juego (con el aviso `practice:done` de verdad) y tachar dos
veces no cambia nada; las palabras y el tablero solo se tachan en su página o su
tablero (el *Word gym* de otra página no cuenta), una parte del examen desde
cualquiera; el simulacro se propone con diez partes probadas y vuelve a
los catorce días; a quien confunde letras o números al oírlos se le propone el
dictado algunos días (no todos: los tableros siguen saliendo), con lo que confunde en
el motivo, a quien no confunde nada nunca, y el dictado se tacha desde cualquier
página; en una semana cambian los tableros; la tarjeta del álbum lleva a cada juego.
*Por qué:* un niño de ocho años no sabe qué practicar; el plan lo decide con lo que
el perfil ya sabe de él.

**22. Los errores vuelven otro día y se arreglan.** `engine/mistakes.js`: lo que
se falla hoy vuelve mañana, no hoy; fallar dos veces la misma pregunta suma en el
mismo error; se arregla acertándolo en dos días distintos (dos veces el mismo día
cuentan una) y un fallo en el repaso reinicia la cuenta; al escribir vale la
respuesta buena y las que el juego acepta, sin mayúsculas ni punto; un error de
elegir sin la buena entre sus opciones no entra; el cuaderno no crece sin tope; la
frase de un hueco se saca entera y sola; la lista de la clase pone primero lo que
fallan más niños. Los doce juegos que apuntan sus fallos siguen haciéndolo (si uno
deja de llamar a `noteMistake`, sale aquí). Y *Fix my mistakes* se juega en un
navegador de prueba: con las respuestas buenas, escrita y elegida, da 2 de 2, al
día siguiente las arregla, y sin errores dice que no hay nada que arreglar.
*Por qué:* repasar lo que se falló, recordándolo de memoria y en días separados,
es lo que más rinde por minuto de estudio. Si un juego deja de apuntar sus fallos
o el cuaderno los devuelve el mismo día, se pierde sin que nadie lo note.

## El trinquete: nada puede retroceder

`checks/baseline.json` guarda los números conseguidos: páginas, cromos, cobertura,
partes cubiertas, puntos, estructuras gramaticales, actividades con juego, piezas
de contenido, escenas, criterios de Speaking, tableros, palabras en tableros,
partes en el informe, partidas jugadas enteras y juegos que apuntan sus fallos en el
cuaderno de errores. El número de archivos que se
guardan sin internet **no** es trinquete a propósito: puede bajar con razón (al
juntar módulos).

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

Formas de cada pieza, que las comprobaciones 5, 6 y 12 vigilan: un diálogo tiene 6
turnos con 3 opciones y un `why`; un texto de Reading 4 tiene 5 huecos con 3 opciones
y un `why`, y 6 trozos; una historia de Reading 3 tiene 5 respuestas, banco de 9, 3
títulos y 6 trozos; una historia de Reading 5 tiene 3 secciones con `art` y 7
preguntas cuya respuesta (1 a 3 palabras) está en el texto; un formulario de
Listening 2 tiene un ejemplo y 5 filas (`say` dice la respuesta; los nombres se
deletrean y llevan `spelled: true`); un juego de emparejar de Listening 3 tiene 6
parejas (la primera es el ejemplo) y 2 dibujos que sobran, con los iconos del álbum;
un diálogo de Listening 4 es adulto-niño, nombra las tres opciones (todas con dibujo
en el álbum) y la pregunta no contiene la respuesta; una historia de Speaking 2
tiene 4 viñetas con `art`, la primera `given`, y cada frase al menos dos palabras
que cuentan el dibujo.

Lo que ninguna batería puede ver y hay que cuidar al escribir:

- **Que sea verdad.** Un texto decía que las ballenas suben «a por agua del cielo»
  porque *air* no está en el syllabus. Si la palabra justa no existe, se cambia la
  frase, no el hecho.
- **Una sola respuesta buena.** En los huecos y las opciones, las palabras que sobran
  no pueden encajar ni por sentido ni por gramática; en Reading 5, `answers` lleva
  todas las formas razonables (*cake* y *chocolate cake*).
- **Los dibujos acompañan, no chivan.** En Reading 5 no se dibuja la palabra que se
  pregunta.
- **Como en el examen, distractores que se nombran.** En Listening 2, 3 y 4 la
  grabación nombra cosas que no son la respuesta («Not on Tuesday. It's on
  Thursday», o un dibujo que es de otra persona).
- Para saber al momento si una frase está en el syllabus, la misma prueba que la
  batería: `words()` de `checks/lib/content.js` con `inSyllabus()` de
  `src/data/syllabus.js`.

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
Yes or no inventa frases falsas poniendo un objeto en el sitio de otro, así que hay
que mirar el dibujo y apuntar en `also` todos los demás sitios donde un objeto
también está (la niña junto a la bici, la ventana junto a la mesa), poner
`ground: true` al suelo, la arena, el mar o las nubes, y no usar sitios donde está
casi todo («on the floor», «on the grass»). Lo de dentro hereda el sitio de lo que
lo contiene y «junto a» vale en los dos sentidos (`placesOf`). Un objeto con dos
colores los lleva los dos. Si se dibuja más de uno, `plural: 'ducks'`; si lo que hace
necesita complemento, `doing: 'flying a kite'`; el color de una persona es el de su
camiseta. Después, **pintar la escena en un navegador** y leer todas las frases que
salen (verdaderas y falsas) mirando el dibujo: un sombrero detrás de la cabeza de un
perro parece puesto, y entonces «The hat is next to the dog» engaña.

**Viñetas de Reading 5 y de Speaking 2** (`reading-stories.js`, `stories.js`):
`art: { bg, items }` con un fondo de `BACKGROUNDS` (`room`, `garden`, `beach`,
`fair`, `field`, `lake`, `riverside`, `snow`, `incar`) y piezas de `PIECES`
(`person` lleva siempre `who` —`boy`, `girl`, `man`, `woman`— y admite `shirt`,
`hair` (gris: persona mayor, con gafas), `mood` (`happy`, `sad`, `scared`) y `nose`
(el payaso), `arm` (`up`: el brazo en alto, para la cuerda de una cometa; `hold`:
la mano a la altura del pecho, para sujetar un helado, un sombrero, una cámara o una
bolsa) y `waist` (solo de cintura para arriba: sentado dentro de un barco); hay
`box` (de regalo si lleva `colour`), `camera`, `duck`, `bird`, `goat`, `cow`,
`chicken`, `egg`, `boat`, `kite` con `string`, `book`, `car`, `bike`, `tree`
(`snow`), `table`, `plate`, `bag`, `bread`, `fruit`, `snowman` (`melted`), `sun`,
`cloud`, `snowcloud`, `river` (`width`)…). El perro (`dog`) tiene `pose`: `stand`,
`sit`, `run` o `sleep`, y se dibuja haciendo lo que dicen las frases. Quien va en
bici no es una `person` aparte: es la opción `rider` de la bici (`{ p: 'bike', o: {
colour, rider: { who, shirt } } }`), que lo sienta en el sillín con los pies en los
pedales. Lo que se sujeta va en la mano: `rightHand(o)` (`art/people.js`) dice dónde
queda, y la cuerda de una cometa empieza justo ahí.

**Los dibujos** están en `src/data/scenes/art/`, pintados como una ilustración
realista: sin contorno negro (la forma la hacen la luz, la sombra y la textura),
con proporciones y anatomía de verdad. `defs.js` es la luz: degradados
semitransparentes que dan volumen a cualquier color (`vol`, `side`, `ball`, `soft`,
`glow`, `blush`, `top`, `glass`, `deep`; `skin` y `face` con sombra cálida para la
piel; `cloth`, `clothV`, `spec`, `warm`; `quill` para cada pluma) y unos filtros
(`blur`, `blur2` y `haze` para sombras, brillos y lejanía; `grain`, `grain2` y
`grassy` para la textura de la arena, la madera, la roca o la hierba; `leafy` rompe
el borde de la copa de los árboles; `blurL`, `grainL` y `grassyL` son los mismos a la
escala de las escenas de colorear, que miden 800). Quien pinta un SVG lo hace dentro
de `withDefs(prefijo, (d) => …)` y mete `d` dentro del `<svg>`; las piezas piden
`grad('ball')`, `fx('blur')` y, para un `clipPath` propio, `uid()`, sin saber en qué
SVG están (cada viñeta tiene su prefijo: en una pantalla hay varias). Los
desenfoques tienen su región en unidades del dibujo y muy amplia: medida sobre la
caja de la forma, la sombra de un trazo fino salía cortada en una franja recta.
`style.js` es el estilo común (`shape`/`lit`/`volume`, `shade` y `shine` difuminados,
`glowSpot` y `crease`, `ground` para la sombra del suelo, `tube` y `smooth` para
formas orgánicas, `seeded` para repartir hojas, pelos o granos siempre igual).
Encima de cada escena va el acabado de cámara (`camera.js`: el velo cálido del sol, el
viñeteado de la lente y el grano del sensor, filtros `film` y `filmL`), que no se
toca y es igual en las dos fotos de *Find the differences*. La sombra de lo que está
de pie (`ground` y la de las personas) es de foto: oscura bajo los pies y proyectada
hacia la derecha (gradiente `cast`), sin filtros. El agua refleja: los fondos con
agua dicen dónde está (`WATER` en `backgrounds.js`) y reflejan la orilla de enfrente,
y `pieces.js` pinta boca abajo, borroso y tenue lo que flota (barcos y patos) dentro
de ese agua o de una pieza `river` (`riverWater`). La ropa lleva el tejido (`fabric`,
`fabric2`). `people.js` son las personas; los animales, cada uno en su módulo (`dog.js` con sus
cuatro posturas, `cat.js`, `birds.js` con las alas pluma a pluma, `livestock.js` con
la vaca y la cabra) sobre lo que comparten en `fur.js` (el pelaje `pelt`, recortado a
la silueta con `clip`, la luz pintada con `paint`, ojos, patas y pezuñas), y
`animals.js` los reúne; `things.js` son las cosas; `backgrounds.js` los fondos;
`colouring.js` lo de las escenas de colorear, donde lo que se pinta va con `paint()`
(empieza en blanco, con su contorno para que se vea qué se colorea) y la luz encima
sigue funcionando con el color que elija el niño. Lo que alguien sujeta lo pone
`pieces.js` en su mano (`holds`, con el punto por donde se coge cada cosa en
`GRIPS`). Al juntar círculos y una franja en un mismo camino, todos van en el mismo
sentido: si no, donde se cruzan quedan agujeros. Una pieza nueva se
dibuja alrededor del origen con los pies en y = 0 y **del mismo tamaño que lo que
sustituye**: las frases («the dog is under the table») dependen de dónde queda. Los
fondos no llevan nubes, sol, árboles ni flores de adorno: cambiarían las
respuestas. Antes de dar un dibujo por bueno, se pinta en un navegador y se leen
sus frases mirándolo (cada pieza que se dibuja después tapa a las anteriores). La
comprobación 12 vigila que cada `url(#…)` de cada dibujo apunte a un degradado de
ese mismo dibujo, que la cuerda de cada cometa salga de una mano en alto, que el
perro haga lo que dice su escena y que quien va en bici diga quién es (`who`).

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
- Si el juego guarda algo nuevo en el perfil del niño (como `letters`, lo que
  confunde al oído), eso tiene que viajar en las copias: `cleanAlbum` (qué entra y
  con qué tipo), `mergeAlbums` (cómo se junta sin perder nada) y `tidy` en
  `engine/backup.js`, y su prueba en la comprobación 20.

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
- Los exámenes de práctica en papel se guardan en el perfil (`paperTests`, los
  veinte últimos) desde el panel del profesor (`ui/paperTests.js`, lógica en
  `engine/paperTests.js`). Las notas se convierten en escudos con `paperShields`, la
  misma tabla que el simulacro, para que todo se pueda comparar.
- **El cuaderno de errores** (`engine/mistakes.js`, en el perfil `mistakes` y
  `mistakesFixed`, y en las copias). Un juego apunta un fallo con
  `noteMistake({ game, kind: 'write' | 'choose', prompt, answer, say?, after?, accept?,
  options?, why?, given? })`: `prompt` es lo que se lee, `say` lo que se oye antes de
  contestar, `after` lo que se oye después (la frase entera), `accept` otras respuestas
  que valen. Solo preguntas que se entienden solas: una pista, una frase con hueco
  (`gapSentence` la saca del texto), lo que dice alguien. Los componentes compartidos
  (`chooser` y `speller`) ya lo hacen con el texto de su pregunta. *Fix my mistakes*
  (`games/fixit`) pregunta los que tocan (`dueMistakes`) y apunta cada intento con
  `fixAttempt`. Se apuntan también los fallos del simulacro (no se dice nada durante
  él: vuelven otro día).
- **La corrección de ortografía** (`engine/spelling.js` + `ui/components/spellingFix.js`):
  `compareSpelling` pone lo escrito debajo de la palabra columna a columna (misma,
  cambiada, falta, sobra) y `spellingHint` da la pista; el componente hace mira, tapa,
  escribe y llama a `onDone(ok)`. Quien lo usa espera a `onDone` para seguir. Nunca en
  el simulacro (`ctx.exam`).
- **El orden de una ronda del Word gym** (`sessionSteps` en `games/vocab/questions.js`):
  las nuevas primero, cada una presentada (`meet`) al menos `MEET_GAP` pasos antes de
  preguntarla; una fallada vuelve `RETRY_GAP` pasos después (una vez). La nota es la del
  primer intento; el reintento cuenta en el repaso de la palabra.
- **De notas a escudos, en un solo sitio.** Los cortes viven en
  `data/shield-table.js` (la tabla de Cambridge para exámenes de práctica: Listening
  sobre 25, Reading and Writing sobre 39). `engine/scoring.js` la usa de dos formas:
  `paperShields(prueba, notas, total)` para una prueba entera (simulacro, exámenes
  en papel; si el total no es el del examen, pasa a proporción) y `shieldsFor(notas,
  total)` para una parte o un juego, con los mismos cortes en proporción (la media de
  las dos pruebas: 45 %, 59 %, 73 % y 84 %). `marksToGo` dice cuánto falta para el
  escudo siguiente y para los 5, y `shieldRanges` da los tramos para enseñar la tabla
  (`ui/components/shieldTable.js`, en *Practice tests on paper* y en las hojas del
  profesor del examen impreso). Speaking va aparte (`scaleShields`, banda media). Si
  la tabla cambia, se cambia en `data/shield-table.js` y todo lo demás la sigue; las
  comprobaciones 8 y 16 dirán qué ejemplos ya no cumple.
- El examen para imprimir (`#/print/<número>`, `ui/printTest.js`) usa los mismos
  generadores que los juegos con `Math.random` cambiado por uno con semilla mientras
  se arma (`withSeed` en `engine/printTest.js`, síncrono y devuelto siempre). Por eso
  un generador de juego que quiera azar tiene que usar `Math.random`, no otra cosa:
  si no, el examen de un número dejaría de salir siempre igual. `#/print` sin número
  elige uno con `router.replace`, que no deja la ruta en el historial. El audio de
  Listening se para al salir (`leavePrint` en `leave()`).
- Las grabaciones de la voz del profesor son del aparato, no de un niño:
  `core/recordings.js` las guarda en IndexedDB (sin IndexedDB, en memoria) con la
  frase normalizada como clave (`keyOf`: comillas, espacios y mayúsculas no cuentan),
  y `speak()` en `core/audio.js` mira el índice en memoria antes de usar la voz del
  navegador. No van en las copias de los álbumes (`exportPack` hace un archivo
  aparte). Si una frase cambia, su grabación deja de usarse: por eso las frases que
  se ofrecen salen de los mismos datos que dicen los juegos (`data/voice-lines.js`).
- Lo que cada niño confunde al oído se guarda en el perfil (`letters`: por letra de
  la A a la Z y por número de pareja, 13-19 y 30-90, cuántas veces se oyó bien y
  cuántas mal) desde `heardAll` en `engine/letters.js`. Solo apunta el dictado, y
  solo cuando lo escrito se parece a lo dictado. `weakSpots` decide qué se confunde
  de verdad (dos fallos o más y al menos una cuarta parte de los intentos): eso sale
  más en el dictado, en su pantalla final y en el informe.
- Un `Enter` en una casilla que, al corregir, pasa el foco a un botón tiene que
  llevar `preventDefault()`: si no, el mismo `Enter` pulsa ese botón y la
  corrección no se llega a ver (le pasó al botón *Next* del dictado).
- `practised(gameId)` (`engine/progress.js`) es lo que llama un juego al terminar:
  sube la racha y avisa con `practice:done`, que es lo que tacha el plan del día.
- `router.afterEach()` corre tras pintar cada pantalla: `main.js` sube al principio,
  pone el título de la pestaña (`ui/pageTitle.js`) y lleva el foco al contenido. Los
  juegos cargan aparte: `ui/gameHost.js` pone su título al montarlos.
- `mount()` guarda el foco: si el botón que lo tenía sigue tras repintar, vuelve a
  él; si no, el foco se queda en la misma zona (con un `tabindex="-1"` que se quita
  cuando el foco se va). Sin esto, quien juega con teclado vuelve al principio de la
  página a cada respuesta. El navegador de prueba pierde el foco como uno de verdad
  cuando se quita el elemento que lo tenía.
- `main.js` llama a `leave()` al principio de cada ruta: para el juego, el simulacro
  y los oyentes de Ajustes. Una pantalla nueva que escuche avisos con `on()` tiene
  que dejar de escucharlos ahí (como `leaveSettings()`), o cada visita deja uno
  colgado.
- Quién juega (`core/profiles.js`) y el álbum cargado (`core/state.js`) se ponen de
  acuerdo en cada ruta (`needsProfile()` en `main.js`). Borrar al que juega deja a
  nadie jugando: la app pregunta quién juega.
- `core/storage.js`: si el aparato está lleno, lo último se queda en memoria y se
  sigue leyendo (`readText`/`writeText`); la barra avisa con `storage:failed`.
- `checks/run.js`: un `console.error` durante una comprobación cuenta como fallo, y
  una comprobación que ni carga sale en rojo (antes la batería se paraba sin decir
  nada).
- Ajustes del aparato (voz, velocidad, sonido) en `core/settings.js`; avisan con
  `settings:changed`. Lo de cada niño va en su perfil (`core/state.js`).
- Las fechas salen de `core/time.js` (`localDate`, `dayBefore`, `localDayNumber`),
  nunca de `toISOString()`, que da el día de UTC.
- Contestar hablando va por `ui/components/voiceInput.js`: micrófono, grabación,
  reconocimiento (si está encendido) y su aviso, todo junto y con `destroy()`.
- Dos ayudas opcionales, fuera de `npm run check`: `tools/sweep-screens.mjs` abre
  cada pantalla (también el informe de un alumno, el examen para imprimir, el
  Speaking cara a cara y la voz del profesor) en un Chromium de verdad a 390 y
  1100 px (o a los anchos que se le
  pidan) y dice si algo se sale, si un texto de ayuda no cabe en su casilla («say
  it, then write it her…») o hay errores (necesita Playwright), y `tools/clock-shift.mjs` mueve el reloj para
  pasar la batería en otra fecha y zona horaria (fin de año, 29 de febrero, Tokio).
- Gancho opcional: con `git config core.hooksPath tools/hooks` no se puede hacer
  commit con `precache-list.js` desfasada (el gancho la regenera y pide añadirla).

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
- **Sin internet con service worker propio**, sin librerías: `sw.js` y la lista
  generada. Se registra con `updateViaCache: 'none'`; en `localhost` no se registra.
- **Restaurar una copia junta, no sustituye.** Nunca se pierde un cromo por restaurar.
- **Contraste AA.** Texto blanco solo sobre los tonos `--*-deep`; en amarillo, texto
  oscuro. Las tarjetas de juego toman el color de su clase `game-card--<color>`.
- **El repaso espaciado sube como mucho un escalón al día** (`u` en cada palabra del
  perfil). Acertar varias veces el mismo día no es repaso espaciado.
- **Un error del cuaderno vuelve otro día y se arregla en dos días distintos.** Lo de
  hoy no se repasa hoy a propósito: la memoria de unos minutos engaña.
- **Solo se apuntan preguntas que se entienden solas.** Una frase de un cuento (Reading
  5, Reading 3) sin el cuento no tiene una sola respuesta; un dibujo no cabe en el
  cuaderno. Esos fallos se repasan volviendo a jugar la parte.
- **En el simulacro nada dice si una respuesta está bien hasta el final.** Cada parte
  del examen mira `ctx.exam` (`ui/components/examQuiet.js`: `isQuiet`, `PICKED`,
  `hideScoreInExam`): apunta, marca lo elegido con `is-picked` y sigue; sin sonido (además
  `cueAllowed` en `core/audio.js` lo calla en modo examen), sin avisos, sin la nota que
  suma, sin la respuesta buena ni el modelo. En Speaking 1 el examinador señala cada
  diferencia. Lo de enseñar al momento es para practicar cada parte suelta.
- **La tabla de escudos es la que cumple los ejemplos de Cambridge.** En noviembre
  de 2026 se buscó la tabla de A1 Movers: Cambridge la publica como imagen en su
  *Mock test toolkit for young learners* («very rough guidance only»), y circulan
  dos transcripciones. La que se usa (Listening 11/14/18/21, Reading and Writing
  18/24/29/33 para 2/3/4/5 escudos) cumple los ejemplos que Cambridge escribe con
  palabras en esa guía (22 de 25 en Listening = 5 escudos; 20 en Reading and Writing
  = 2 escudos; y los de Starters y Flyers con sus tablas); la otra (Reading and
  Writing 13/20/28/34) da 3 escudos por 20 y contradice a Cambridge. No cambiarla sin
  la imagen oficial delante.
