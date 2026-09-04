# REVIEW.md

Lo que hay que comprobar antes de dar por terminado cualquier trabajo en este proyecto.

## La regla

```
npm run check
```

Si sale **TODO EN VERDE**, se puede entregar. Si sale algo rojo, **no se entrega**:
se arregla primero. No hay excepciones y no vale "es un detalle menor".

El comando tarda unos segundos y no necesita internet ni instalar nada.

## Qué comprueba, y por qué cada cosa está ahí

Ninguna de estas siete comprobaciones es teórica. Todas están porque ese error
ya ocurrió de verdad en este proyecto.

**1. Estructura del código.** Imports rotos o sin usar, `console.log` olvidados,
`localStorage` fuera de `core/`, y que `index.html` no pida nada por internet.
*Por qué:* la web tiene que funcionar en un aula sin conexión.

**2. Vocabulario dentro del syllabus.** Cada palabra inglesa que ve u oye un
alumno tiene que estar en las listas de Starters o Movers.
*Por qué:* se colaron `medicine`, `calendar`, `hour`, `sell`, `leave`, `use`,
`visit`, `high`, `hard`, `land`, `warm`, `bench` y `fence`. Todas son de Flyers.
Un niño estudiando palabras que no le van a preguntar es tiempo de clase tirado.

**3. Álbum completo y coherente.** Cada una de las **894 entradas del wordlist
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

**4. Fidelidad al examen real.** Las 15 partes están cubiertas, ninguna dos veces,
todas listas, y en el orden del examen.
*Por qué:* es el objetivo del proyecto. Si una parte se cae, se cae la nota.

**5. Los generadores nunca crean partidas rotas.** 300 rondas de cada juego
comprobando sus reglas: que Word hunt no repita opciones, que el intruso no
repita fichas, que Match the names no cree dos personas idénticas.
*Por qué:* estos fallos aparecen una vez de cada trescientas. Probando a mano no
se ven; en clase con veinte niños, sí.

**6. Los correctores aceptan lo correcto y rechazan lo falso.** Cada respuesta
modelo tiene que puntuar al máximo, y una respuesta falsa no.
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
su resultado** en vez de pintar su propia pantalla final.
*Por qué:* si alguien añade un juego y se olvida de `ctx.onFinish`, el simulacro
se queda colgado en esa parte y no se nota hasta que un niño lo prueba.

**9. Todo el wordlist se puede practicar.** Las 894 entradas llegan al motor de
vocabulario y cada una produce una pregunta válida. Los tres tipos de ejercicio
siguen existiendo y el corrector acepta la respuesta correcta de cada palabra.
*Por qué:* el álbum enseñaba las 894 palabras pero los ejercicios solo tocaban
unas 300. Las que no se dibujan (adjetivos, verbos, preposiciones) no se
practicaban en ninguna parte.

**10. Los tipos de actividad del libro de aula.** Las formas en -ly y en -ing se
generan bien (20 casos difíciles comprobados uno a uno), los distractores son
siempre tres, y en Yes or no **ninguna frase marcada como falsa puede ser cierta
en el modelo de la escena**.
*Por qué:* el generador de Yes or no llegó a decir que «The dog is in the garden»
era falso, cuando el perro sí estaba en el jardín. Usaba lugares genéricos como
respuesta falsa. Una actividad que castiga al niño por acertar es peor que no
tenerla.

**11. Hay contenido para un curso.** Cada parte del examen tiene un mínimo de
piezas distintas, para que un niño no repita el mismo texto antes de un trimestre.
*Por qué:* con 2 diálogos y 2 historias, en tres semanas se los saben de memoria y
dejan de practicar para pasar a recordar.

**12. Las escenas dibujadas cumplen sus reglas.** En las de colorear, los objetos
del SVG coinciden con la lista, hay cartel para la pregunta de escribir, y **cada
familia tiene al menos dos objetos**. En las de la Parte 6, la suma da 10 puntos,
las piezas existen, nada queda fuera del lienzo y hay al menos cuatro objetos con
color.
*Por qué:* si una familia tiene un solo objeto, el niño lo identifica sin escuchar
la posición y la parte 5 de Listening deja de entrenar lo que entrena. Y si una
escena describe algo con una palabra de Flyers, se le pide colorear algo que no
sabe nombrar.

**13. Las seis actividades del picture book.** Los números del 21 al 100 y los
ordinales del 1.º al 20.º se generan bien y en vocabulario del syllabus; las
parejas de contrarios están las dos en la lista; en la sopa de letras cada palabra
está donde dice y se puede encontrar tocando; las frases con banco no se chivan y
su objetivo tiene dibujo; y el corrector de frases puntúa el modelo y rechaza el
vacío.
*Por qué:* eran los seis tipos de actividad del picture book que la app no tenía.
Los números eran además la única parte del syllabus que seguía floja.

## El trinquete: nada puede retroceder

`checks/baseline.json` guarda los números conseguidos: páginas, cromos, cobertura,
partes cubiertas, puntos, estructuras gramaticales.

**Si alguno baja, la comprobación falla.** Da igual que todo lo demás esté verde.
Esto es lo que impide perder por el camino algo que ya funcionaba.

Cuando algo mejora de verdad, se sube la marca:

```
npm run check:update
```

Solo se hace **después** de tener todo en verde, y siempre a propósito. Actualizar
la línea base para tapar un retroceso es hacerse trampas al solitario.

## Sobre el material de Cambridge

Del libro de actividades de aula se extrajo **el inventario de tipos de actividad**,
no su contenido. Las frases, los textos y los dibujos del libro tienen autor y
copyright, y están publicados para usarlos como fichas en clase, no para
republicarlos dentro de un programa.

Cada tipo de actividad está implementado con un **generador original** que trabaja
sobre el wordlist. Eso además rinde más: el libro trae 6 hojas fijas, y estos
generadores producen ejercicios distintos cada vez.

## El vocabulario NO se edita a mano

`src/data/wordlist.js`, `src/data/topics.js`, `src/data/syllabus.js` y
`src/data/wordlist-source.js` están **generados desde el PDF oficial**. Editarlos a
mano es cómo se rompió antes.

Si hace falta cambiar algo (un icono, un tema), se cambia el generador y se vuelve
a generar:

```
python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf
npm run check
```

El PDF no está en el repositorio; se descarga gratis de la web de Cambridge o se
lo pides al profesor. La comprobación 3 falla si aparece un cromo que no está en el
PDF o si falta alguna entrada.

## Al añadir contenido nuevo

Si añades un juego con textos en inglés, tienes que darlo de alta en
`checks/lib/content.js`. Si no, su vocabulario no se revisa y volverán a colarse
palabras de Flyers.

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

## Al añadir un juego nuevo

- Darlo de alta en `src/games/registry.js` con su `tag` de parte del examen.
- Añadirlo a la prueba que le toque en `PAPERS`, en `src/engine/mock.js`.
- **En su `finish()`, entregar el resultado con `ctx.onFinish`** antes de pintar
  nada. Sin eso el simulacro se cuelga.
- Añadir su parte a la lista `EXAM` de `checks/04-exam.js` con sus puntos reales.
- Añadir sus invariantes a `checks/05-generators.js`.
- Añadir sus respuestas modelo a `checks/06-checkers.js`.

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
  vienen del syllabus público; los textos, escenas y actividades son originales.
