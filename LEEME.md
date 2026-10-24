# Mi Álbum Movers

Web de práctica para el examen Cambridge A1 Movers (en papel), dirigida a niños de 8 a 10 años.
Interfaz en inglés. Contenido original construido sobre el syllabus público de A1 Movers.

Esta es la guía para el profesor: qué hace cada cosa y por qué. Lo técnico está en
`README.md` y `REVIEW.md`.

## Lo último

- **Los ocho tableros del picture book.** En el álbum hay una sección nueva, *Picture
  boards*: la juguetería, la fiesta, el médico, la casa de vacaciones del tío Charlie,
  la excursión al campo, el tiempo, la ciudad y los sueños de vacaciones. Cada tablero
  enseña sus palabras con el dibujo del álbum, un texto que se puede escuchar, cuatro
  preguntas de *Let's talk!* y tres juegos que solo usan esas palabras.
- **Más contenido donde hacía falta.** Diez diálogos de Reading 2 (había 3), diez
  historias con huecos de Reading 3 (había 6), diez textos de gramática de Reading 4
  (había 6) y ocho historias de Reading 5 (había 4), todas con sus viñetas.
- **Informe imprimible para las familias.** Desde *Class progress*, botón *Report* junto
  a cada alumno: una hoja con lo que sabe, cómo va cada parte del examen, la escala de
  Speaking, los simulacros hechos y qué practicar en casa. Botón *Print* o Ctrl+P.
- **Los simulacros se guardan.** El Statement of Results de cada simulacro terminado se
  queda en el perfil del alumno (los diez últimos) y aparece en el informe.
- **El examen, más fiel.** *Listen and tick* es la parte 4 de Listening de verdad; *Tell
  the story* hace la tarea real de Speaking 2; en *Find the differences* el examinador
  describe primero su dibujo; en *Match the names* lo que se oye es un diálogo.
- **Las 18 actividades del libro de aula tienen juego**, con cinco entrenamientos
  nuevos: *What did you do yesterday?*, *Word pairs*, *A busy day*, *What's the
  matter?* y *Where are they?*
- **La escala de Speaking del handbook**, para el niño y para el profesor.
- **Las páginas del álbum son las de Cambridge**: 24 páginas según la tabla temática del
  wordlist, 883 cromos, uno por entrada.

## Cuánto contenido hay

591 piezas distintas, repartidas así:

| Parte | Piezas |
|---|---|
| Reading 1, definiciones | 123 |
| Reading 2, diálogos | 10 |
| Reading 3, historias con huecos | 10 |
| Reading 4, textos de gramática | 10 |
| Reading 5, historias de lectura | 8 |
| Reading 6, escenas | 4 |
| Listening 2, formularios | 8 |
| Listening 3, emparejamientos | 8 |
| Listening 4, diálogos de Listen and tick | 16 |
| Listening 5, escenas de colorear | 4 |
| Speaking 2, historias | 8 |
| Speaking 3, conjuntos de intruso | 32 |
| Speaking 4, preguntas personales | 24 |
| Tableros del picture book | 8, con 32 preguntas y 48 frases |
| Frases con banco de dibujos | 32 |
| Palabras para escribir una frase | 24 |
| Verbos con frase en pasado | 108 |
| Palabras compuestas | 24 |
| Lugares de Where are they? | 22 |

Las escenas están dibujadas a mano en SVG: parque, playa, clase y cocina para
colorear; jardín, cocina, feria y playa para la Parte 6, que además alimentan
Yes or no; y 27 piezas con 6 fondos para las viñetas de las historias.

Más los generadores, que no se agotan: las diferencias salen de una escena
paramétrica con seis ranuras, el gimnasio recorre las 883 palabras, y -ly / -ing
producen ejercicios de 121 pares distintos.

La comprobación 11 vigila que ninguna de estas cifras baje de su mínimo.

## Word gym: las 883 palabras, todas

En el álbum, encima de los juegos de examen, hay una sección aparte:
**«Practise the words on this page»**.

Diez palabras por ronda, elegidas así: primero las que ha fallado, luego las que
nunca ha visto, luego las que toca repasar. Repaso espaciado sencillo: cada
acierto duplica la espera, un fallo la reinicia.

Cada palabra se pregunta de la forma que admite:

- **315 con dibujo** — oye la palabra y toca la imagen.
- **528 de escribir** — oye la palabra y la escribe. Ortografía exacta.
- **40 de elegir** — oye la palabra y la elige entre cuatro escritas.

Los dos últimos tipos valen para cualquier entrada del wordlist, incluidos
adjetivos, verbos y preposiciones. Por eso la cobertura es del 100 % y no del 33 %.

Desde un tablero, el Word gym pregunta solo las palabras de ese tablero.

### Los cromos se ganan sabiendo, no jugando

Antes los cromos se desbloqueaban por orden de lista: si acertabas cinco
preguntas, recibías los cinco siguientes cromos de la página, fueran o no las
palabras practicadas. El álbum premiaba jugar.

Ahora un cromo se gana cuando la palabra está **dominada**: dos aciertos y el
último intento bien. La barra de cada página cuenta palabras que el niño sabe.

## La gramática oficial, las 25 estructuras

`src/data/grammar-list.js` es la *Grammar and Structures List* de A1 Movers,
transcrita del handbook con su ejemplo oficial. La comprobación 7 verifica que
**cada una de las 25 aparece de verdad en el contenido de la app**.

Cuando se midió por primera vez contra la lista real salieron 18 de 25. Las siete
que faltaban eran todas conversacionales, y se cubrieron con un tercer diálogo en
la parte 2 de Reading: *What's the matter*, *Shall I…?*, *How about going…*,
*have got to*, *want someone to do something*, objetos indirectos y *go for a walk*.

## Los tableros del picture book

El *A1 Movers Wordlist Picture Book* es una lámina por escena con las palabras del
wordlist que aparecen en ella. De ahí se toma **el inventario**: qué escenas hay y
qué palabras señala cada una. Los dibujos, los textos, las preguntas y las frases
son propios.

En el álbum, la sección **Picture boards** abre cada tablero:

- **Las palabras de la lámina**, cada una con su dibujo del álbum, y marcadas las que
  el niño ya domina. El contador cuenta las palabras del tablero que sabe.
- **Un texto que presenta la escena**, con el botón *Read it to me* para oírlo.
- **Let's talk!, cuatro preguntas** sobre el tablero, con altavoz para oír cada una.
  Son las que se hacen en clase delante de la lámina.
- **Tres juegos solo con ese tablero**: *Let's talk!* (contestar a las cuatro
  preguntas, de viva voz y después por escrito; una buena respuesta se oye después de
  cada una), *What are they doing today?* (seis frases del tablero con hueco y un banco
  de ocho dibujos) y *Word gym* (solo esas palabras).

Los tableros: *The toy shop*, *The party*, *At the doctor's*, *Uncle Charlie's holiday
house*, *A trip to the countryside*, *The weather*, *Our town* y *Dreaming of holidays*.
Entre todos tocan 155 palabras del wordlist.

## Las actividades del picture book

Del picture book se extrajeron los siete tipos de actividad que trae, y los siete
están implementados como generadores originales sobre el wordlist:

| Actividad del libro | En la app |
|---|---|
| Which number? | **Which number?** Cifra ↔ letra del 21 al 100, ordinales del 1.º al 20.º |
| Can you find the words? | **Find the words.** Sopa de letras con palabras de la página abierta |
| Monkey goes swimming! | **Opposites.** 28 parejas de contrarios, dos huecos por frase |
| What are the Movers doing today? | **What are they doing today?** Frase con hueco y banco de 8 dibujos |
| Let's talk! | **Let's talk!** Cuatro preguntas sobre una lámina o sobre un tablero |
| Who's who? | **Which number?** Los ordinales, con cifras |
| Remember | **Use the word.** 24 palabras gramaticales, corrector de frase propia |

Viven en `src/games/` como juegos de entrenamiento (`PRACTICE`). Comparten un
esqueleto en `src/ui/components/miniGame.js` para no repetir código.

## Las actividades del libro de aula

Del PDF de *classroom activities* se extrajo el inventario de tipos de actividad
(18: seis hojas con tres actividades cada una) y las 18 tienen juego. Además de
las partes del examen que ya las cubrían, hay estos entrenamientos:

**Yes or no?** Mira el dibujo, lee la frase y responde sí o no. Dos ejemplos
resueltos y seis preguntas, como en el libro. Las frases **se generan del modelo de
la escena**, así que la respuesta correcta se sabe con certeza y nunca se
desincroniza del dibujo.

**Add -ly and -ing.** Formación de palabras. Los pares salen del wordlist oficial:
6 adjetivos que tienen su adverbio en la lista, y 115 verbos para -ing. Las reglas
ortográficas están implementadas: *ride → riding*, *run → running*, *travel →
travelling*, *be → being*. Cada respuesta explica la regla que aplica.

**Why or When.** Es uno de los textos de la parte 4 de Reading, que es donde
encaja: es una elección gramatical. Cubre *when, why, where, who, how old*.

**What did you do yesterday?** Una frase en pasado (*Yesterday Jim … a big fish*) y
tres o cuatro formas del verbo (*catch, caught, catching, catched*). El niño elige el
pasado; después de cada respuesta ve la regla (*catch, caught: irregular, hay que
saberlo*; *stop: dobla la última letra*). Verbos de Starters y Movers.

**Word pairs.** Dos palabras hacen una nueva: *swimming + … → pool*. Las parejas son
las palabras compuestas del wordlist (*comic book*, *bus stop*, *ice cream*…), una
cada vez, con cuatro opciones y nunca dos válidas.

**A busy day.** *At seven o'clock, in the morning, on Monday, before lunch*: el niño
elige la preposición que encaja con el momento. Las horas tienen sentido (nadie
desayuna a las dos) y en las de antes/después los números que ve no engañan.

**What's the matter?** La enfermera pregunta; el niño ve el dibujo de una parte del
cuerpo y escribe *My … hurts* (arm, ear, eye, foot, hand, head, leg, mouth, nose,
tooth), con un banco de ocho dibujos. La ortografía tiene que ser exacta, como en el
examen: si está casi bien, se le dice, pero no puntúa.

**Where are they?** Alguien dice lo que está haciendo (*I am reading a book. It is very
quiet here.*) y el niño escribe dónde está (*He is at the library*), con un banco de
ocho lugares. Las pistas dan lo que hace la persona, nunca el nombre del lugar.

De todo esto se extrajo la **estructura**, no el contenido: las frases y los dibujos
del libro tienen copyright de Cambridge. Los generadores son originales, y además
producen ejercicios distintos cada vez, mientras que el libro trae 6 hojas fijas.

## El simulacro

Botón **Mock test** en cualquier página del álbum, o `#/mock`.

Encadena las 15 partes en el orden del examen y con sus tiempos oficiales:
Listening 25 minutos, Reading and Writing 30, Speaking sin reloj. Se puede hacer
el examen entero o solo una prueba.

Dentro del simulacro cambian las reglas, a propósito:

- **Cada grabación suena exactamente dos veces.** El botón lleva la cuenta y se
  apaga: *Say it again (1)*, luego *No more plays*. Fuera del simulacro se puede
  repetir sin límite, porque ahí se está aprendiendo, no examinando.
- **El texto de las instrucciones no se puede mostrar.** Desaparece el botón.
- **Nadie dice si una respuesta está bien** hasta el final.
- **Cuando se acaba el reloj, esa prueba se corta** y lo que falta cuenta cero,
  con un aviso explicando por qué.

Al terminar sale un **Statement of Results** con los escudos de cada prueba y el
desglose parte por parte, con el mismo formato que el certificado real. Se guarda
en el perfil del alumno (los diez últimos) y sale en su informe.

## La escala de Speaking

En el examen real, Speaking no tiene aciertos: el examinador puntúa tres cosas de 0 a
5 (*Vocabulary and grammar*, *Pronunciation*, *Interaction*) y de ahí salen los
escudos. La app hace lo mismo.

- Al acabar la prueba de Speaking del simulacro, el niño se puntúa él mismo con tres
  preguntas sencillas (sus palabras y frases, si se le entendía, cómo respondió), y
  eso decide los escudos de esa prueba. Los aciertos se siguen mostrando.
- En *Class progress* hay una columna *Speaking scale* y, debajo de la tabla, la
  escala completa para que el profesor puntúe a un alumno después de oírle hablar
  (bandas 5, 3 y 1 descritas; 4 y 2 son intermedias). La nota del profesor manda
  sobre la del niño, y el comentario que escriba sale en el informe.
- Si el niño dijo solo un par de palabras, la pronunciación no puede pasar de 3: es
  una regla del handbook.

## El informe para las familias

En *Class progress*, cada alumno tiene un botón **Report**. Abre una hoja con:

- cuántas palabras sabe de las 883, cuántas partes del examen tiene listas, los
  escudos que suma y los días seguidos jugando;
- **qué practicar en casa**: las tres partes más flojas, con una idea concreta para
  cada una que una familia puede hacer sin saber inglés avanzado;
- la tabla de las 15 partes con sus escudos y una palabra: *Ready* (4 o 5 escudos),
  *Nearly there* (3), *Needs practice* (1 o 2) o *Not tried yet*;
- la escala de Speaking, con quién la puso y el comentario del profesor;
- los simulacros hechos, por fecha y prueba;
- las palabras que sabe en cada una de las 24 páginas;
- dos líneas para firmar.

Botón **Print** (o Ctrl+P). Al imprimir desaparece todo lo que no es el informe y
los escudos se ven aunque la impresora no pinte fondos. El informe no sale del
aparato: se imprime desde el mismo navegador donde juega el niño.

## El panel del profesor

`#/teacher`, o desde la pantalla de perfiles. Tabla con los escudos de cada alumno
en cada parte del examen, cromos, racha, la nota de Speaking y en qué parte va peor.
Desde ahí se abre el informe de cada alumno, se puntúa Speaking con la escala y se
borran álbumes.

## Antes de tocar nada: la revisión

```
npm run check
```

Dieciséis comprobaciones y un trinquete, 35 en total. Si sale **TODO EN VERDE**, se
puede seguir construyendo. Si sale algo rojo, se arregla antes de entregar.

Las reglas completas están en `REVIEW.md`. La versión corta: cada comprobación
está ahí porque ese error ya ocurrió de verdad en este proyecto.

El **trinquete** (`checks/baseline.json`) guarda los números conseguidos —páginas,
cromos, cobertura, partes del examen, estructuras gramaticales, tableros, piezas de
contenido— y falla si alguno baja. Es lo que impide perder por el camino algo que
ya funcionaba.

## Cómo abrirlo

Los módulos ES no funcionan si abres `index.html` haciendo doble clic. Hay que servirlo.
Desde la carpeta del proyecto, cualquiera de estas dos:

    npx serve .

    python -m http.server 8000

Y abrir la dirección que aparezca en la terminal.

## Qué hay hecho

- Álbum completo: 24 páginas, 883 cromos, progreso guardado en el navegador por alumno.
- Escudos y racha de días, igual que el sistema de Cambridge.
- **Quince juegos: el examen entero.** Listening 5 de 5, Reading and Writing 6 de 6 y
  Speaking 4 de 4. Los 64 puntos escritos del examen están cubiertos. En el álbum
  salen en el mismo orden que en el examen real.
- **Dieciséis entrenamientos**: Word gym, Word hunt, Story order, Yes or no?, Add -ly
  and -ing, What did you do yesterday?, Word pairs, A busy day, What's the matter?,
  Where are they?, Which number?, Find the words, Opposites, What are they doing
  today?, Let's talk! y Use the word.
- Ocho tableros del picture book, simulacro completo, escala de Speaking, panel del
  profesor e informe imprimible.

## Cómo funciona cada parte de Listening

**Parte 1, Match the names.** Seis personas en un parque y siete nombres: uno sobra
siempre, y al terminar se le dice cuál era. La escena se genera al azar, y a propósito
un color de camiseta y una acción se repiten, nunca en la misma persona. Así nadie se
identifica con un solo dato, que es justo lo que avisa el handbook. Lo que se oye es
un diálogo, como en el examen: el adulto pregunta, el niño da un dato, el adulto se
confunde con otra persona del dibujo y el niño rectifica.

**Parte 2, Listen and write.** Un cuaderno con cinco huecos y un ejemplo. Aquí la
corrección sigue tres reglas distintas del handbook:

- Si el nombre se deletrea en la grabación (*That's C-L-A-R-E*), la ortografía tiene
  que ser perfecta. Si falla, se le enseña el deletreo otra vez.
- En las demás palabras se admite un fallo pequeño: *saturdy* cuenta como *Saturday*.
- Los números en letra puntúan, pero se le recomienda escribirlos en cifras, que es
  lo que dice el handbook para no perder el punto por ortografía.

**Parte 3, Listen and match.** Siete imágenes con letra, cinco respuestas. Las dos que
sobran también se mencionan en el audio, igual que en el examen, y al terminar se le
explica por qué: hay que escuchar la frase entera, no cazar la primera palabra.

**Parte 4, Listen and tick.** Cinco diálogos entre un adulto y un niño, una pregunta y
tres dibujos (A, B, C). En cada diálogo se nombran los tres y se descartan dos, así que
hay que escuchar hasta el final. *Word hunt* (oír la palabra y tocar el dibujo) sigue
como entrenamiento de vocabulario.

**Parte 5, Listen and colour.** Cinco preguntas: cuatro de colorear y una de escribir,
como en el examen real. La voz lee la instrucción con `speechSynthesis` del navegador,
acento británico si está disponible. El texto sale borroso por defecto (*Show the
words* lo revela) para que primero escuchen. Si colorean el objeto equivocado o con el
color equivocado, cuenta como fallo, igual que en el examen. La ortografía de la
palabra escrita tiene que ser exacta.

## Cómo funciona cada parte de Reading and Writing

**Parte 1, Spell it.** Un banco de ocho palabras con dibujo, cinco definiciones, y
tres opciones que sobran. El alumno lee (o escucha) la definición y **escribe** la
respuesta. No la elige: la escribe. La ortografía tiene que ser exacta y el artículo
también. El corrector distingue cuatro tipos de fallo y da un mensaje distinto para
cada uno:

- olvidar el artículo: *So close. You need the "a"*
- artículo equivocado: *Almost. It's "an", not "a"*
- palabra correcta mal escrita: *Right word, wrong spelling*
- palabra equivocada

Al terminar, si ha fallado artículos, sale un aviso específico. Es el error que más
puntos cuesta en esa parte del examen. Las 123 definiciones están en
`src/data/definitions.js`, escritas solo con vocabulario de Starters y Movers.

**Parte 2, What do you say?** Un chat entre dos personas. El niño elige lo que
contesta el segundo. Seis puntos. Cada respuesta lleva su explicación: por qué esa y no
las otras. El detalle que trabaja: **no todas las líneas son preguntas**. A veces la otra
persona solo te cuenta algo, le ofrece ayuda o se despide, y ahí no vale contestar sí
o no. Es el fallo que señala el handbook. Diez diálogos.

**Parte 3, Fill the story.** Nueve palabras, cinco huecos, cuatro palabras que sobran.
Y al final, elegir el mejor título entre tres. Seis puntos. Al terminar se le dice qué
cuatro palabras no se usaban nunca. Diez historias.

**Parte 4, Choose the right word.** Cinco huecos y tres opciones cada uno, con **foco
gramatical**, que es lo que mide esta parte. Los huecos no son de vocabulario: son
`can't` frente a `don't`, `where` frente a `which`, `better than`, `because`, `their`.
Cada acierto y cada fallo llevan la regla escrita: *"Where" is for places*, *With "than"
you need the comparative*. Diez textos.

**Parte 5, Read and answer.** 7 puntos. Una historia en tres secciones, cada una con
su viñeta, y siete frases que completar con una, dos o tres palabras. Dos reglas del
handbook que el juego respeta y explica al alumno: **los dibujos no dan la respuesta**
(acompañan, nada más; todas las respuestas están en el texto) y **la ortografía tiene
que ser exacta** (si escribe la palabra correcta mal escrita, se lo dice con ese
mensaje concreto). El texto queda siempre visible mientras responde, como en el
examen. Las ocho historias están enteras en pasado simple, que es justo la gramática
que separa Movers de Starters. Al añadir una, comprobar que cada respuesta aparezca
literalmente en el texto y que no pase de tres palabras.

**Parte 6, Write about the picture.** La que más puntos vale de todo el examen: **10
de los 39 puntos de esa prueba**. Replica la estructura oficial: preguntas 1 y 2,
completar una frase (1 punto); 3 y 4, responder a una pregunta sobre el dibujo (2
puntos); 5 y 6, escribir dos frases propias y distintas (2 puntos). Cada escena lleva
un modelo de lo que contiene (`entities`), con el objeto, su color, su acción y su
posición. El corrector aplica **los dos criterios del examen por separado**: que se
entienda (mínimo tres palabras y todas dentro del syllabus) y que sea verdad en el
dibujo (si escribe *The dog is blue* y el perro es marrón, da un punto en vez de dos
y se lo explica). También detecta si la frase 6 es casi igual que la 5, que es
exactamente lo que penaliza el examen. **La gramática no resta.** El handbook es
explícito: los errores que no impiden entender no bajan la nota en esta parte.

## Cómo funciona cada parte de Speaking

**Parte 1, Find the differences.** Los dos dibujos salen de la misma escena
paramétrica: `src/data/scenes/garden.js` define seis ranuras (cielo, pelota, cometa,
flores, gato, pájaro) y cada partida cambia cuatro de ellas. El examinador describe su
dibujo (*In my picture the ball is under the tree. And in your picture?*), el niño dice
la diferencia y después oye el modelo. Si toca algo que es igual, se lo dice y cuenta:
cada tres toques equivocados pierde un punto.

**Parte 2, Tell the story.** La tarea real: los cuatro dibujos en orden, el examinador
dice el título y cuenta el primero, y el niño cuenta los otros tres hablando
(micrófono, grabación, o escribiendo lo que dijo si no hay micrófono). Después de cada
dibujo oye una forma de decirlo. Contar el dibujo puntúa silencio 0, algo 1, frase con
sentido 2. La antigua versión (ordenar los dibujos y montar las frases) sigue como
entrenamiento, *Story order*. Las ocho historias están en `src/data/stories.js`; las
viñetas se componen con las piezas de `src/data/scenes/pieces.js`.

**Parte 3, The odd one out.** Tres pasos por conjunto, porque en el examen no basta con
señalar: cuatro dibujos y el niño toca el que sobra; completa la frase con fichas
(*These are all [animals], but this is [food]*); la voz lee la frase completa y el niño
la repite en voz alta. Acertar el intruso sin saber decir por qué solo da la mitad.
Los 32 conjuntos están en `src/data/oddoneout.js`.

**Parte 4, Talk about you, y qué pasa con el micrófono.** El examinador pregunta cosas
del niño (colegio, fin de semana, amigos, aficiones) y espera respuestas cortas pero no
de una sola palabra. Seis preguntas, doce puntos. La primera es siempre el nombre, como
en el examen. Hay tres formas de contestar y el juego elige la que puede:

1. **Grabación (por defecto donde haya micrófono).** El audio se graba y se reproduce
   en el propio aparato. **No sale de ahí.**
2. **Reconocimiento de voz (apagado por defecto).** Si se enciende, el navegador
   transcribe lo que dice y el juego lo evalúa. Aviso importante: **Chrome y Edge
   envían el sonido a servidores de Google para transcribirlo.** Es voz de menores
   saliendo del dispositivo. Por eso viene apagado, hay que encenderlo a mano y sale
   un aviso naranja mientras está activo. En Firefox no existe y el botón ni aparece.
3. **Escribir.** Siempre disponible. Si no hay micrófono o no hay permiso, el juego
   no se bloquea nunca.

Las dos primeras necesitan https o localhost. Con `npx serve` funciona. Cómo puntúa:
un punto por contestar y otro por contestar algo que tenga que ver con la pregunta.
**Nunca baja a cero por una palabra mal transcrita.** Debajo están siempre a mano las
frases de socorro: *Sorry?*, *Can you say that again, please?*, *I don't understand*.
El handbook insiste en que callarse cuesta puntos de interacción y pedir ayuda no.

## El álbum cubre el 100 % del wordlist

`src/data/wordlist.js` se genera **extrayendo el PDF oficial con `pdftotext`**, no a
mano. Son 24 páginas y **883 cromos: uno por cada entrada del wordlist de Pre A1
Starters y A1 Movers**, con ese nombre exacto y sin cromos inventados.

La lista canónica vive en `src/data/wordlist-source.js` y es contra lo que mide la
comprobación del álbum. Las páginas son las de la **tabla temática del propio PDF**
(páginas 38-43): animales, cuerpo, ropa, colores, familia, comida, salud, casa,
nombres, lugares, colegio, deportes, días y tiempo, juguetes, transporte, clima,
trabajos, el mundo… y las seis últimas recogen lo que el PDF no clasifica por tema:
adjetivos, verbos, palabras pequeñas, saludos, pronombres y adverbios. Cuando una
palabra cambia de página, los cromos ya ganados la siguen.

315 palabras llevan dibujo. El resto son cromos de solo texto, porque un adjetivo o una
preposición no se dibujan sin ambigüedad. **Ningún icono se repite entre dos palabras
distintas**: el generador lo comprueba y degrada automáticamente la palabra que pierde,
porque Word hunt enseña cuatro dibujos y tienen que poder distinguirse.

`src/data/syllabus.js` contiene las palabras de Starters y Movers transcritas del
PDF oficial, más el reconocimiento de plurales, gerundios, pasados, comparativos,
contracciones y verbos irregulares. Es lo que permite decirle a un niño que una palabra
que ha escrito no entra en su examen.

## Estructura

    index.html
    src/
      main.js              arranque y rutas
      core/                dom, eventos, almacenamiento, estado, router, audio, voz
      data/                vocabulario, temas, tableros, contenido de cada juego,
                           escenas SVG
      engine/              puntuación, progreso, vocabulario, formas de palabra,
                           escala de Speaking, simulacro, informe
      games/               registro + un módulo por juego (15 del examen,
                           16 de entrenamiento)
      ui/                  barra superior, álbum, tablero, perfiles, panel del
                           profesor, informe, simulacro, contenedor de juegos,
                           componentes compartidos
      styles/              fuentes, tokens, base, shell, álbum, juego, informe
      fonts/               woff2 empaquetados (Baloo 2, Atkinson Hyperlegible)
    checks/                las 16 comprobaciones y la línea base del trinquete
    tools/                 el generador del álbum desde el PDF oficial

Cada juego expone la misma interfaz (`mount(root, ctx)` que devuelve `{ destroy }`),
así que añadir uno nuevo solo requiere crear su carpeta en `games/` y darlo de alta
en `games/registry.js`.

## Para añadir escenas al juego de colorear

Copia `src/data/scenes/park.js`, cambia el SVG y la lista de `objects`, y da de alta
la escena nueva en `src/data/scenes/index.js`. Nada más.

Reglas de una escena:
- Cada objeto pintable va en un `<g class="paintable" data-obj="id-unico">`.
- Dentro, las formas que se colorean llevan `class="fillable"`.
- Los `data-obj` del SVG tienen que coincidir con los `id` de la lista `objects`.
- Conviene tener tres familias de objetos (`family`) con dos o tres miembros cada una:
  es lo que obliga al niño a escuchar la posición y no solo el nombre del objeto.
- Hace falta un `<text id="sign-text">` vacío para la pregunta de escribir.

## Aviso

Los exámenes de muestra, el handbook, el libro de actividades y el picture book de
Cambridge tienen copyright y su reglamento prohíbe reproducirlos. Aquí no hay nada
copiado: el vocabulario, las estructuras y la estructura del examen vienen del
syllabus público; las escenas, los textos, los tableros, las frases y las
actividades son originales.

## Privacidad

Todo se guarda en el navegador del dispositivo, en `localStorage`. No hay servidor,
no hay cuentas y nada sale del aparato. Si borras los datos del navegador, se van
los álbumes. El panel del profesor y el informe solo leen lo que hay en ese mismo
dispositivo.
