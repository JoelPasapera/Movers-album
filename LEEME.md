# Mi Álbum Movers

Web de práctica para el examen Cambridge A1 Movers (en papel), dirigida a niños de 8 a 10 años.
Interfaz en inglés. Contenido original construido sobre el syllabus público de A1 Movers.

## Novedades de esta revisión

- **Perfiles por alumno.** Al abrir, la web pregunta quién juega. Cada niño tiene su
  álbum, sus cromos y su racha. Sin esto, tres alumnos en la misma tablet comparten todo.
- **Panel del profesor** en `#/teacher`: tabla con los escudos de cada alumno en cada
  juego, cromos conseguidos, racha y en qué parte del examen va peor. También se borran
  álbumes desde ahí.
- **Botón de silencio** en la barra superior.
- **Aviso si el dispositivo no tiene voz inglesa.** Sin él, el navegador leía el inglés
  con la voz del idioma del sistema y nadie se enteraba.
- **Vocabulario revisado contra el wordlist oficial.** Fuera `medicine` y `calendar`
  (son de Flyers). Reescritas ocho definiciones que usaban *sell, leave, use, visit,
  feel, high, hard, land*, todas de nivel superior.
- **La barra de escudos ya no miente.** Antes, un solo juego perfecto marcaba 5 de 5
  porque promediaba únicamente lo jugado. Ahora promedia sobre los seis.
- **Accesibilidad:** los botones de color llevan el nombre escrito (antes un niño
  daltónico no podía jugar) y los objetos del SVG se alcanzan con tabulador y Enter.
- **Sin internet.** Las fuentes van empaquetadas en `src/fonts/` (84 KB, licencia OFL).
  La web ya no hace ni una petición externa: funciona en un aula sin conexión.
- **Viñetas ilustradas.** Las historias ya no usan emoji sino dibujos SVG.

## Cuánto contenido hay

286 piezas distintas, repartidas así:

| Parte | Piezas |
|---|---|
| Reading 1, definiciones | 123 |
| Reading 2, diálogos | 3 |
| Reading 3, historias con huecos | 6 |
| Reading 4, textos de gramática | 6 |
| Reading 5, historias de lectura | 4 |
| Reading 6, escenas | 4 |
| Listening 2, formularios | 8 |
| Listening 3, emparejamientos | 8 |
| Listening 5, escenas de colorear | 4 |
| Speaking 2, historias | 8 |
| Speaking 3, conjuntos de intruso | 32 |
| Speaking 4, preguntas personales | 24 |

Las ocho escenas están dibujadas a mano en SVG: parque, playa, clase y cocina para
colorear; jardín, cocina, feria y playa para la Parte 6, que además alimentan
Yes or no.

Más los generadores, que no se agotan: las diferencias salen de una escena
paramétrica con seis ranuras, el gimnasio recorre las 888 palabras, y -ly / -ing
producen ejercicios de 121 pares distintos.

La comprobación 11 vigila que ninguna de estas cifras baje de su mínimo.

## Word gym: las 888 palabras, todas

En el álbum, encima de los juegos de examen, hay una sección aparte:
**«Practise the words on this page»**.

Diez palabras por ronda, elegidas así: primero las que ha fallado, luego las que
nunca ha visto, luego las que toca repasar. Repaso espaciado sencillo: cada
acierto duplica la espera, un fallo la reinicia.

Cada palabra se pregunta de la forma que admite:

- **292 con dibujo** — oye la palabra y toca la imagen.
- **556 de escribir** — oye la palabra y la escribe. Ortografía exacta.
- **46 de elegir** — oye la palabra y la elige entre cuatro escritas.

Los dos últimos tipos valen para cualquier entrada del wordlist, incluidos
adjetivos, verbos y preposiciones. Por eso la cobertura es del 100 % y no del 33 %.

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

## Las actividades del picture book

Del *wordlist picture book* se extrajeron los seis tipos de actividad que trae, y
los seis están implementados como generadores originales sobre el wordlist:

| Actividad del libro | En la app |
|---|---|
| Which number? | **Which number?** Cifra ↔ letra del 21 al 100, ordinales del 1.º al 20.º |
| Can you find the words? | **Find the words.** Sopa de letras con palabras de la página abierta |
| Monkey goes swimming! | **Opposites.** 28 parejas de contrarios, dos huecos por frase |
| What are the Movers doing today? | **What are they doing today?** Frase con hueco y banco de 8 dibujos |
| Let's talk! | **Let's talk!** Cuatro preguntas sobre una lámina, generadas de su modelo |
| Use each word in a sentence | **Use the word.** 24 palabras gramaticales, corrector de frase propia |

Los seis viven en `src/games/` como juegos de entrenamiento (`PRACTICE`). Comparten
un esqueleto en `src/ui/components/miniGame.js` para no repetir código.

## Las actividades del libro de aula

Del PDF de *classroom activities* se extrajo el inventario de tipos de actividad
(14 en 6 hojas) y se cotejó con lo que ya había. Faltaban cuatro, y ya están:

**Yes or no?** Mira el dibujo, lee la frase y responde sí o no. Dos ejemplos
resueltos y seis preguntas, como en el libro. Las frases **se generan del modelo de
la escena**, así que la respuesta correcta se sabe con certeza y nunca se
desincroniza del dibujo.

**Add -ly and -ing.** Formación de palabras. Los pares salen del wordlist oficial:
6 adjetivos que tienen su adverbio en la lista, y 115 verbos para -ing. Las reglas
ortográficas están implementadas: *ride → riding*, *run → running*, *travel →
travelling*, *be → being*. Cada respuesta explica la regla que aplica.

**Why or When.** Añadido como tercer texto de la parte 4 de Reading, que es donde
encaja: es una elección gramatical. Cubre *when, why, where, who, how old*.

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
desglose parte por parte, con el mismo formato que el certificado real.

## Antes de tocar nada: la revisión

```
npm run check
```

Siete comprobaciones y un trinquete. Si sale **TODO EN VERDE**, se puede seguir
construyendo. Si sale algo rojo, se arregla antes de entregar.

Las reglas completas están en `REVIEW.md`. La versión corta: cada comprobación
está ahí porque ese error ya ocurrió de verdad en este proyecto.

El **trinquete** (`checks/baseline.json`) guarda los números conseguidos —páginas,
cromos, cobertura, partes del examen, estructuras gramaticales— y falla si alguno
baja. Es lo que impide perder por el camino algo que ya funcionaba.

## Cómo abrirlo

Los módulos ES no funcionan si abres `index.html` haciendo doble clic. Hay que servirlo.
Desde la carpeta del proyecto, cualquiera de estas dos:

    npx serve .

    python -m http.server 8000

Y abrir la dirección que aparezca en la terminal.

## Qué hay hecho

- Álbum completo: 10 temas, 129 cromos, progreso guardado en el navegador.
- Escudos y racha de días, igual que el sistema de Cambridge.
- Juego **Listen and colour** terminado y jugable (Listening parte 5).
- Juego **Word hunt** terminado y jugable (Listening parte 4).
- Juego **Spell it** terminado y jugable (Reading and Writing parte 1).
- Juego **The odd one out** terminado y jugable (Speaking parte 3).
- Juego **Find the differences** terminado y jugable (Speaking parte 1).
- Juego **Tell the story** terminado y jugable (Speaking parte 2).
- Dos escenas: **In the park** y **At the beach**. Salen al azar y nunca se repite
  la misma dos veces seguidas al darle a "Play again".
- **Quince juegos: el examen entero.** Listening 5 de 5, Reading and Writing 6 de 6 y
  Speaking 4 de 4. Los 64 puntos escritos del examen están cubiertos. En el álbum
  salen en el mismo orden que en el examen real.

## Cómo funciona Listen and colour

Cinco preguntas: cuatro de colorear y una de escribir, como en el examen real.
La voz lee la instrucción con `speechSynthesis` del navegador, acento británico si está disponible.
El texto sale borroso por defecto ("Show the words" lo revela) para que primero escuchen.
Si colorean el objeto equivocado o con el color equivocado, cuenta como fallo, igual que en el examen.
La ortografía de la palabra escrita tiene que ser exacta.

## Cómo funciona Word hunt

Se juega sobre el tema del álbum que tengas abierto. La voz dice una instrucción del
tipo *Find the...*, *Point to the...*, *Show me the...* (las mismas fórmulas que usa el
examinador) y el niño toca el dibujo. Cuatro opciones, sin texto visible hasta que responde.
Hay temporizador de 9 segundos y contador de racha.

Si el tema tiene pocas palabras dibujables, la partida se completa con palabras de otros
temas para que nunca baje de seis preguntas.

## Cómo funciona Spell it

Copia la estructura de la parte 1 de Reading and Writing: un banco de ocho palabras
con dibujo, cinco definiciones, y tres opciones que sobran. El alumno lee (o escucha)
la definición y **escribe** la respuesta. No la elige: la escribe.

La ortografía tiene que ser exacta y el artículo también. El corrector distingue
cuatro tipos de fallo y da un mensaje distinto para cada uno:

- olvidar el artículo: *So close. You need the "a"*
- artículo equivocado: *Almost. It's "an", not "a"*
- palabra correcta mal escrita: *Right word, wrong spelling*
- palabra equivocada

Al terminar, si ha fallado artículos, sale un aviso específico. Es el error que más
puntos cuesta en esa parte del examen.

Las 60 definiciones están en `src/data/definitions.js`, escritas solo con vocabulario
de Starters y Movers. Si añades más, comprueba que la definición no contenga la propia
palabra ni vocabulario de nivel superior.

## Cómo funciona The odd one out

Tres pasos por conjunto, porque en el examen no basta con señalar:

1. Cuatro dibujos, el niño toca el que sobra.
2. Completa la frase con fichas: *These are all [animals], but this is [food].*
   Dos huecos, tres opciones cada uno.
3. La voz lee la frase completa y el niño la repite en voz alta.

Puntúa por separado el paso 1 y el paso 2, así que cuatro conjuntos son ocho puntos.
Acertar el intruso sin saber decir por qué solo da la mitad. Si falla razones,
al final sale un aviso recordándolo.

El paso 3 no se puede verificar sin reconocimiento de voz, que solo funciona bien en
Chrome. La rutina de escuchar y repetir se mantiene igual: es lo que se hace en clase.

Los 16 conjuntos están en `src/data/oddoneout.js`. Cada uno son tres palabras de una
categoría y una que no encaja, más las dos etiquetas que forman la frase.

## Las tres últimas partes de Reading and Writing

**Parte 2, What do you say?** Un chat entre dos personas. El niño elige lo que
contesta el segundo. Seis puntos. Cada respuesta lleva su explicación: por qué esa y no
las otras. El detalle que trabaja: **no todas las líneas son preguntas**. A veces la otra
persona solo te cuenta algo, y ahí no vale contestar sí o no. Es el fallo que señala
el handbook.

**Parte 3, Fill the story.** Nueve palabras, cinco huecos, cuatro palabras que sobran.
Y al final, elegir el mejor título entre tres. Seis puntos. Al terminar se le dice qué
cuatro palabras no se usaban nunca.

**Parte 4, Choose the right word.** Cinco huecos y tres opciones cada uno, con **foco
gramatical**, que es lo que mide esta parte. Los huecos no son de vocabulario: son
`can't` frente a `don't`, `where` frente a `which`, `better than`, `because`, `their`.
Cada acierto y cada fallo llevan la regla escrita: *"Where" is for places*, *With "than"
you need the comparative*.

Aquí es donde por fin entra toda la gramática nueva de Movers.

## Cómo funciona Talk about you, y qué pasa con el micrófono

Es la Parte 4 de Speaking: el examinador pregunta cosas del niño (colegio, fin de
semana, amigos, aficiones) y espera respuestas cortas pero no de una sola palabra.
Seis preguntas, doce puntos. La primera es siempre el nombre, como en el examen.

Hay tres formas de contestar y el juego elige la que puede:

**1. Grabación (por defecto donde haya micrófono).** El audio se graba y se reproduce
en el propio aparato. **No sale de ahí.** Sirve para que el niño se escuche y se compare
con la respuesta modelo, que es lo que se hace en clase.

**2. Reconocimiento de voz (apagado por defecto).** Si se enciende, el navegador
transcribe lo que dice y el juego lo evalúa. Aviso importante: **Chrome y Edge envían
el sonido a servidores de Google para transcribirlo.** Es voz de menores saliendo del
dispositivo. Por eso viene apagado, hay que encenderlo a mano y sale un aviso naranja
mientras está activo. En Firefox no existe y el botón ni aparece.

**3. Escribir.** Siempre disponible. Si no hay micrófono o no hay permiso, el juego
no se bloquea nunca.

Las dos primeras necesitan https o localhost. Con `npx serve` funciona.

Cómo puntúa: un punto por contestar y otro por contestar algo que tenga que ver con la
pregunta. **Nunca baja a cero por una palabra mal transcrita**, porque el reconocimiento
falla mucho con acento infantil no nativo y sería injusto.

Debajo están siempre a mano las frases de socorro: *Sorry?*, *Can you say that again,
please?*, *I don't understand*. El handbook insiste en que callarse cuesta puntos de
interacción y pedir ayuda no.

## Las tres partes nuevas de Listening

**Parte 1, Match the names.** Seis personas en un parque y siete nombres: uno sobra
siempre, y al terminar se le dice cuál era. La escena se genera al azar, y a propósito
un color de camiseta y una acción se repiten, nunca en la misma persona. Así nadie se
identifica con un solo dato, que es justo lo que avisa el handbook.

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

## Cómo funciona Read and answer

Es la Parte 5 de Reading and Writing: 7 puntos. Una historia en tres secciones, cada
una con su dibujo, y siete frases que completar con una, dos o tres palabras.

Dos reglas del handbook que el juego respeta y explica al alumno:

- **Los dibujos no dan la respuesta.** Acompañan, nada más. Todas las respuestas están
  en el texto. Se lo decimos por escrito antes de empezar y otra vez al terminar.
- **La ortografía tiene que ser exacta.** Si escribe la palabra correcta mal escrita,
  se lo dice con ese mensaje concreto y se lo cuenta aparte al final.

El texto queda siempre visible mientras responde, como en el examen.

**Estas historias son el único sitio del proyecto donde había pasado simple.** Todo lo
demás estaba en presente, y el pasado es justo la gramática que separa Movers de
Starters. Las dos historias están enteras en pasado: *went, took, wore, stopped, had,
came, said, got, ran, gave, rode, bought, found, laughed*.

Las historias están en `src/data/reading-stories.js`. Al añadir una, comprobar que
cada respuesta aparezca literalmente en el texto y que no pase de tres palabras.

## Cómo funciona Write about the picture

Es la Parte 6 de Reading and Writing, la que más puntos vale de todo el examen:
**10 de los 39 puntos de esa prueba**. Replica la estructura oficial:

- Preguntas 1 y 2: completar una frase. 1 punto cada una.
- Preguntas 3 y 4: responder a una pregunta sobre el dibujo. 2 puntos cada una.
- Preguntas 5 y 6: escribir dos frases propias y distintas. 2 puntos cada una.

Lo difícil era corregir escritura libre sin conexión. Se resuelve así: cada escena
lleva un modelo de lo que contiene (`entities`), con el objeto, su color, su acción y
su posición. El corrector aplica **los dos criterios del examen por separado**:

1. **Que se entienda.** Mínimo tres palabras y todas dentro del syllabus. Si escribe
   *pizza* o *laptop*, se le avisa de que no es una palabra de Movers.
2. **Que sea verdad en el dibujo.** Si escribe *The dog is blue* y el perro es marrón,
   da un punto en vez de dos y se lo explica.

También detecta si la frase 6 es casi igual que la 5, que es exactamente lo que
penaliza el examen.

**La gramática no resta.** El handbook es explícito: los errores que no impiden
entender no bajan la nota en esta parte. El corrector no comprueba gramática.

Las escenas están en `src/data/scenes/part6.js`. Para añadir una: dibujarla con las
piezas, listar sus objetos con color y posición, y escribir las seis preguntas.

## Sobre el vocabulario completo

`src/data/syllabus.js` contiene las 849 palabras de Starters y Movers transcritas del
PDF oficial, más el reconocimiento de plurales, gerundios, pasados, comparativos,
contracciones y verbos irregulares. Es lo que permite decirle a un niño que una palabra
que ha escrito no entra en su examen.

## Cómo funciona Find the differences

Los dos dibujos salen de la misma escena paramétrica: `src/data/scenes/garden.js`
define seis ranuras (cielo, pelota, cometa, flores, gato, pájaro) y cada partida
cambia cuatro de ellas. Nunca se repite la misma combinación dos veces seguidas.

El niño toca lo que ve distinto. Si toca algo que es igual, se lo dice y cuenta:
cada tres toques equivocados pierde un punto. Al encontrar una diferencia, la voz
lee la frase modelo (*Here the ball is red, but here it is blue*) y él la repite.

Para añadir ranuras: una entrada más en `SLOTS` con sus valores y su frase, y
dibujarla en `renderScene` dentro de un `<g data-slot="id">`.

## Cómo funciona Tell the story

Dos fases, calcadas del examen:

1. Cuatro viñetas desordenadas. El niño las pone en orden. Puntúa cada posición.
2. La viñeta 1 viene contada, igual que hace el examinador. Las tres siguientes las
   construye el alumno tocando fichas de palabras hasta formar la frase. Luego la
   escucha y la repite.

Siete puntos por partida: cuatro del orden y tres de las frases.

Las cinco historias están en `src/data/stories.js`.

Las viñetas son ilustraciones SVG compuestas a partir de `src/data/scenes/pieces.js`:
17 piezas reutilizables (personas, animales, objetos) y 6 fondos. Cada viñeta declara
su fondo y una lista de piezas con posición y escala. Para dibujar una historia nueva
no hace falta abrir un editor de vectores: se combinan piezas.

Las personas admiten color de camiseta, color de pelo, altura de adulto y estado de
ánimo (`happy`, `sad`, `scared`), que es lo que permite ilustrar frases como
*Fred is very sad* o *Daisy is frightened*.

## El álbum cubre el 100% del wordlist

`src/data/wordlist.js` se genera **extrayendo el PDF oficial con `pdftotext`**, no a
mano. Son 25 páginas y **888 cromos: uno por cada entrada del wordlist de Pre A1
Starters y A1 Movers**, con ese nombre exacto y sin cromos inventados.

La lista canónica vive en `src/data/wordlist-source.js` y es contra lo que mide la
comprobación del álbum. Antes se medía contra una transcripción hecha a mano que se
había dejado nueve entradas fuera (`catch`, `could`, `café`, `don't worry`, `dad`,
`table`, `wait`, `o'clock`, `a lot of`): daba 100% contra una referencia incompleta.

Las 18 primeras páginas siguen las categorías temáticas del PDF (animales, cuerpo, ropa,
colores, familia, comida, salud, casa, nombres, lugares, colegio, deportes, tiempo,
juguetes, transporte, clima, trabajos, el mundo). Las 6 últimas recogen lo que el PDF
no clasifica por tema: adjetivos, verbos, palabras pequeñas, saludos, pronombres y
adverbios.

313 palabras llevan dibujo. El resto son cromos de solo texto, porque un adjetivo o una
preposición no se dibujan sin ambigüedad. **Ningún icono se repite entre dos palabras
distintas**: el generador lo comprueba y degrada automáticamente la palabra que pierde,
porque Word hunt enseña cuatro dibujos y tienen que poder distinguirse.

En las páginas sin dibujos (verbos, adjetivos, palabras pequeñas) Word hunt no se
bloquea: juega con vocabulario de todo el álbum y los cromos que gana son igualmente
de esa página.

## Sobre el vocabulario y los dibujos

En `src/data/wordlist.js` cada palabra lleva un tercer valor: `1` si se puede reconocer
por dibujo y `0` si no. Los adjetivos, los verbos y las palabras abstractas van a `0`,
y también las que comparten icono con otra palabra. Word hunt solo usa las de `1`;
el álbum las muestra todas.

Si añades vocabulario, comprueba que el icono nuevo no se repita con ninguno existente.

## Estructura

    index.html
    src/
      main.js              arranque y rutas
      core/                dom, eventos, almacenamiento, estado, router, audio
      data/                paleta, vocabulario, temas, escenas SVG
      engine/              puntuación y progreso
      games/               registro + un módulo por juego (los seis)
      ui/                  barra superior, álbum, perfiles, panel del profesor,
                           contenedor de juegos, componentes compartidos
      styles/              fuentes, tokens, base, shell, álbum, juego
      fonts/               woff2 empaquetados (Baloo 2, Atkinson Hyperlegible)

Cada juego expone la misma interfaz (`mount(root, ctx)` que devuelve `{ destroy }`),
así que añadir uno nuevo solo requiere crear su carpeta en `games/` y darlo de alta
en `games/registry.js`. No se toca nada más.

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

Los exámenes de muestra, el handbook y el picture book de Cambridge tienen copyright
y su reglamento prohíbe reproducirlos. Aquí no hay nada copiado: el vocabulario y las
estructuras vienen del syllabus público, y las escenas, frases y actividades son originales.


## Privacidad

Todo se guarda en el navegador del dispositivo, en `localStorage`. No hay servidor,
no hay cuentas y nada sale del aparato. Si borras los datos del navegador, se van
los álbumes. El panel del profesor solo lee lo que hay en ese mismo dispositivo.
