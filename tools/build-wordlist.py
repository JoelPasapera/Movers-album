#!/usr/bin/env python3
"""Genera el album desde el PDF oficial del wordlist de Cambridge.

    python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf
    python3 tools/build-wordlist.py --selftest     (repasa los casos que ya fallaron)

Escribe cuatro archivos, y NINGUNO de ellos se edita a mano:
    src/data/wordlist-source.js   la lista canonica extraida del PDF
    src/data/wordlist.js          el album, un cromo por entrada
    src/data/topics.js            las paginas del album
    src/data/syllabus.js          las listas usadas para validar vocabulario

Necesita `pdftotext` (paquete poppler-utils).

Historia, para que no se repita:
  - El modo columnas de pdftotext partia las entradas con parentesis y perdia
    "catch (e.g. a ball) v". Por eso se usa el modo plano y se unen las lineas
    que quedan cortadas.
  - Los encabezados de pagina se pegaban a la primera palabra y se tragaron
    "dad", "table", "wait", "o'clock" y "a lot of".
  - El bloque "Grammatical key" colaba adj, adv, conj, det, dis, excl, int,
    poss y pron como si fueran palabras.
  - La marca "poss adj" va separada por espacio, no por "+". El detector de
    marcas solo entendia "+" y dejo siete cromos llamados "her poss",
    "my poss"... y ninguno llamado "her" o "my".
  - Los parentesis "(music)", "(computer)" y "(as sports equipment)" no se
    limpiaban y dieron los cromos "band music", "keyboard computer",
    "mouse computer" y "bat as sports equipment".
  - La linea "(No words at this level)" de la letra X se pegaba a "yesterday"
    y el album tenia un cromo "No words at this level yesterday".
  - Las grafias US entre parentesis ("colour (US color)") NO son entradas del
    wordlist: valen para el syllabus, no para el album. Antes daban tres
    cromos (color, center, favorite) que Cambridge no lista.
  - Partir "T-shirt" y "e-book" por el guion metia "t" y "e" en el syllabus
    como si fueran palabras. Los compuestos con guion se guardan enteros.
  - "city/town centre" daba "city" y "town centre" en vez de "city centre" y
    "town centre". Salia bien de casualidad porque la lista trae tambien
    "town/city centre". El --selftest lo vigila.
"""

import html
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAGS = r"(?:adj|adv|conj|det|dis|excl|int|n|poss|prep|pron|v|title)"
TAG_WORDS = {'adj', 'adv', 'conj', 'det', 'dis', 'excl', 'int', 'n',
             'poss', 'prep', 'pron', 'v', 'title'}
ENDS = re.compile(r"\s(%s)((?:\s*\+\s*|\s+)%s)*(\s+of\s+[\w\s+]+)?$" % (TAGS, TAGS))
NOISE = re.compile(r"(Pre A1 Starters|A1 Movers|A2 Flyers)\s*A.Z wordlist|\ufeff")
SKIP = re.compile(r"^(Grammatical key|Letters & numbers|Names|Numbers|Candidates|adjective|"
                  r"adverb|conjunction|determiner|discourse marker|exclamation|interrogative|"
                  r"noun|possessive|preposition|pronoun|verb|[A-Z]|"
                  r"\(No words at this level\)|\d+)$")
# Parentesis explicativos del PDF. No son parte de la palabra.
# (UK ...)/(US ...) se tratan aparte en clean(); "(s)", "(e)", "(got)", "(up)"
# y "(bear)" son partes opcionales de la palabra y se conservan.
PAREN = re.compile(r"\((?:as in|as sports|e\.g\.|i\.e\.|for|music|computer)[^)]*\)")
OK = re.compile(r"^[A-Za-z\u00c0-\u017f][A-Za-z\u00c0-\u017f' \-]*$")

# Paginas del PDF: Starters 4-7, Movers 8-11.
PAGES = {'S': (4, 7), 'M': (8, 11)}

# Tabla tematica del mismo PDF ("thematic vocabulary list"). Tres columnas
# por nivel; solo se leen las de Starters y Movers.
THEMATIC_PAGES = (38, 43)

# Tema de Cambridge -> pagina del album. Materials (solo "paper" en Starters)
# y Numbers (cifras, mas "hundred" y "pair") no tienen pagina propia.
CATEGORY_PAGE = {
    'Animals': 'animals', 'The body and the face': 'body', 'Clothes': 'clothes',
    'Colours': 'colours', 'Family & friends': 'family', 'Food & drink': 'food',
    'Health': 'health', 'The home': 'home', 'Materials': None, 'Names': 'names',
    'Numbers': None, 'Places & directions': 'places', 'School': 'school',
    'Sports & leisure': 'sports', 'Time': 'time', 'Toys': 'toys',
    'Transport': 'transport', 'Weather': 'weather', 'Work': 'work',
    'The world around us': 'world',
}

# Cambridge lista 75 palabras en dos o tres temas (bike: Sports, Toys y
# Transport) y un cromo solo puede estar en una pagina. Gana la primera
# pagina de esta lista que este entre los temas de la palabra. Ordenada de lo
# concreto a lo general: un animal antes que una comida (chicken), un oficio
# antes que la salud o la escuela (doctor, teacher), un vehiculo antes que un
# juguete (car), la casa antes que la escuela (desk).
THEME_PRIORITY = ['animals', 'body', 'clothes', 'colours', 'family', 'food', 'work',
                  'health', 'weather', 'transport', 'time', 'home', 'school', 'places',
                  'world', 'sports', 'toys', 'names']

# Las diez palabras en que esa regla acierta al reves. Cada una con su razon.
THEME_EXCEPTIONS = {
    'doll': 'toys', 'game': 'toys', 'toy': 'toys',        # son juguetes, no deportes
    'hospital': 'places',                                  # no es un oficio
    'in': 'places',                                        # preposicion de lugar primero
    'ride': 'sports', 'run': 'sports', 'swim': 'sports', 'walk': 'sports',  # ocio, no transporte
    'tree': 'world',                                       # esta fuera, no en casa
}


def cambridge_page(key, themes):
    """Pagina que dicta la tabla tematica para una palabra, o None si no la lista."""
    pages = [CATEGORY_PAGE[c] for c in themes.get(key, []) if CATEGORY_PAGE.get(c)]
    if not pages:
        return None
    if key in THEME_EXCEPTIONS:
        return THEME_EXCEPTIONS[key]
    return next(page for page in THEME_PRIORITY if page in pages)


def pdf_lines(pdf, first, last):
    out = subprocess.run(['pdftotext', '-f', str(first), '-l', str(last), pdf, '-'],
                         capture_output=True, text=True, check=True)
    return out.stdout.splitlines()


def pdf_words(pdf, first, last):
    """Palabras con coordenadas: [(pagina, x0, y0, x1, texto)]. Hace falta
    para la tabla tematica, que es una tabla de columnas: sin la x no se sabe
    de que nivel es cada palabra."""
    out = subprocess.run(['pdftotext', '-bbox', '-f', str(first), '-l', str(last), pdf, '-'],
                         capture_output=True, text=True, check=True)
    words, page = [], 0
    for line in out.stdout.splitlines():
        if '<page ' in line:
            page += 1
        m = re.search(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="[\d.]+">(.*?)</word>', line)
        if m:
            text = html.unescape(m.group(4))
            words.append((page, float(m.group(1)), float(m.group(2)), float(m.group(3)), text))
    return words


def thematic_table(words, known):
    """Lee la tabla tematica y devuelve {clave de cromo: [temas de Cambridge]}.

    `known` son las claves de las entradas ya extraidas de la lista A-Z: sirve
    para pegar bien las celdas que el PDF parte en dos lineas ("film (US movie)"
    + "star" es "film star", pero "sky" + "star" son dos palabras).
    Las columnas se reconocen por su x: etiqueta del tema < 100, Starters
    100-250, Movers 250-405, Flyers a partir de 405 (se ignora).
    """
    def column(x):
        if x < 100:
            return 'label'
        if x < 250:
            return 'S'
        if x < 405:
            return 'M'
        return None

    themes, current, label_buf = {}, None, []
    last_cell = {}
    for page in sorted({w[0] for w in words}):
        rows, line = [], []
        for w in sorted((w for w in words if w[0] == page and 60 < w[2] < 800), key=lambda w: (w[2], w[1])):
            if line and abs(w[2] - line[-1][2]) > 2:
                rows.append(line)
                line = []
            line.append(w)
        if line:
            rows.append(line)
        for row in rows:
            y = row[0][2]
            texts = [w[4] for w in row]
            if 'A1' in texts and any(t in ('Starters', 'Movers', 'Flyers') for t in texts):
                continue
            labels = [w[4] for w in row if column(w[1]) == 'label']
            if labels:
                label_buf += labels
                for n in range(min(5, len(label_buf)), 0, -1):
                    tail = ' '.join(label_buf[-n:])
                    if tail in CATEGORY_PAGE:
                        current, label_buf = tail, []
                        break
                else:
                    for n in range(min(5, len(label_buf)), 0, -1):
                        starts = [c for c in CATEGORY_PAGE if c.split(' ')[:n] == label_buf[-n:]]
                        if len(starts) == 1:
                            current = starts[0]
                            break
            for level in ('S', 'M'):
                # Dentro de una celda las palabras van a 2-3 pt; entre celdas
                # hay 10 pt o mas. Cada nivel tiene dos subcolumnas, a unos
                # 75 pt una de otra: la celda se asigna por donde EMPIEZA.
                cells = []
                for w in sorted((w for w in row if column(w[1]) == level), key=lambda w: w[1]):
                    if cells and w[1] - cells[-1][1] <= 8:
                        cells[-1][1] = w[3]
                        cells[-1][2].append(w[4])
                    else:
                        cells.append([w[1], w[3], [w[4]]])
                for x0, _, toks in cells:
                    text = ' '.join(toks)
                    sub = (level, 0 if x0 < (145 if level == 'S' else 295) else 1)
                    prev, prev_page, prev_y = last_cell.get(sub, (None, 0, 0))
                    if prev_page != page or not 0 < y - prev_y < 16:
                        prev = None    # solo continua lo que esta en la linea de justo encima
                    joined = None
                    if prev is not None:
                        joined = prev + text if prev.endswith('/') else prev + ' ' + text
                    continues = prev is not None and (
                        prev.count('(') > prev.count(')') or prev.endswith('/')
                        or text.startswith('(')
                        or (any(h.lower() in known for h in clean(joined)[0])
                            and text.lower() not in known))
                    if continues:
                        for h in clean(prev)[0]:
                            if themes.get(h.lower(), [None])[-1] == current:
                                themes[h.lower()].pop()
                        text = joined
                    if text.endswith(':') or text.startswith('The days of'):
                        last_cell[sub] = (None, page, y)
                        continue
                    last_cell[sub] = (text, page, y)
                    for h in clean(text)[0]:
                        key = h.lower()
                        if current and current not in themes.setdefault(key, []):
                            themes[key].append(current)
    themes = {k: v for k, v in themes.items() if v}
    unknown = sorted(k for k in themes if k not in known)
    if unknown:
        print('AVISO: la tabla tematica trae %d palabras que no estan en la lista A-Z '
              '(se ignoran): %s' % (len(unknown), ', '.join(unknown)))
    return {k: v for k, v in themes.items() if k in known}


def parse(lines):
    joined, buf = [], ''
    for raw in lines:
        line = re.sub(r"\s+", " ", NOISE.sub(' ', raw.replace('\u2019', "'"))).strip()
        if not line or SKIP.match(line):
            continue
        buf = (buf + ' ' + line).strip() if buf else line
        if ENDS.search(buf):
            joined.append(buf)
            buf = ''
        elif len(buf) > 80:
            buf = ''
    return [(e[:ENDS.search(e).start()].strip(), ENDS.search(e).group(0).strip()) for e in joined]


def clean(entry):
    """Una entrada del PDF puede dar varios cromos: mouse/mice, child/children.

    Devuelve (cromos, grafias). Las grafias son las variantes UK/US entre
    parentesis: cuentan para el syllabus pero no son entradas del wordlist,
    asi que no reciben cromo.
    """
    e = PAREN.sub("", entry.replace('\u2019', "'").strip())
    e = re.sub(r"\(s \+ pl\)", "", e).strip()
    variants = []
    m = re.search(r"\((?:UK|US)\s+([^)]+)\)", e)
    if m:
        variants.append(m.group(1).strip())
        e = re.sub(r"\((?:UK|US)\s+[^)]+\)", "", e).strip()
    forms = []
    m = re.fullmatch(r"([\w']+)\((\w+)\)", e)
    if m:
        forms.append(m.group(1) + m.group(2))
        e = m.group(1)
    e = re.sub(r"\s+", " ", e.replace('(', ' ').replace(')', ' ')).strip()
    heads = []
    if '/' in e:
        # La barra separa alternativas de UNA palabra: "city/town centre" son
        # "city centre" y "town centre"; "take a photo/picture", dos verbos.
        toks = e.split(' ')
        j = next(i for i, t in enumerate(toks) if '/' in t)
        for alt in toks[j].split('/'):
            heads.append(' '.join(toks[:j] + [alt.strip()] + toks[j + 1:]).strip())
    else:
        heads.append(e)
    heads = [h for h in dict.fromkeys(heads + forms) if h and OK.match(h)]
    spellings = [v for v in variants if OK.match(v)]
    return heads, spellings


def extract(pdf):
    entries, spellings = {}, {'S': set(), 'M': set()}
    for level, (first, last) in PAGES.items():
        for raw, tag in parse(pdf_lines(pdf, first, last)):
            heads, variants = clean(raw)
            spellings[level].update(v.lower() for v in variants)
            for head in heads:
                key = head.lower()
                if key in TAG_WORDS or key in entries:
                    continue
                entries[key] = {'word': head, 'tag': tag, 'level': level}
    return entries, spellings


# Paginas del album. La tabla tematica de Cambridge decide la pagina de las
# 593 palabras que clasifica (ver cambridge_page). Las listas de aqui son la
# colocacion PROPIA del resto: palabras que Cambridge no clasifica por tema
# (app, laptop, idea, treasure...) y que la app coloca por criterio propio.
# Una palabra que Cambridge clasifica no debe aparecer aqui: no haria nada.
THEMES = {
 'animals': ("Animals", "green", "#CDEBD3", """
 """),
 'body': ("The body and the face", "pink", "#FBD9E6", """
 """),
 'clothes': ("Clothes", "purple", "#E7DCF7", """
 pair """),
 'colours': ("Colours", "red", "#FBD7D4", """
 """),
 'family': ("Family and friends", "orange", "#FFE0C7", """
 """),
 'food': ("Food and drink", "yellow", "#FFE9A8", """
 """),
 'health': ("Health", "red", "#FBD7D4", """
 hurt """),
 'home': ("The home", "brown", "#EADBCB", """
 app laptop tablet e-book machine """),
 'names': ("Names", "grey", "#E2E5EC", """
 """),
 'places': ("Places and directions", "purple", "#E7DCF7", """
 stop top bottom """),
 'school': ("School", "blue", "#D7E6FB", """
 e-book noise shape thing name idea difference """),
 'sports': ("Sports and leisure", "green", "#CDEBD3", """
 treasure shopping """),
 'time': ("Days and time", "blue", "#D7E6FB", """
 age hundred """),
 'toys': ("Toys", "orange", "#FFE0C7", """
 """),
 'transport': ("Transport", "brown", "#EADBCB", """
 travel """),
 'weather': ("Weather", "blue", "#D7E6FB", """
 """),
 'work': ("Jobs and work", "grey", "#E2E5EC", """
 """),
 'world': ("The world around us", "green", "#CDEBD3", """
 jungle """),
 'describing': ("Describing words", "pink", "#FBD9E6", """
 angry beautiful big clean closed cool dirty double fantastic funny good great happy long 
 new nice sad scary short silly small ugly afraid asleep awake bad best better boring brave 
 brilliant busy careful clever dangerous different difficult dry easy exciting famous first 
 frightened hot huge last little loud naughty pretty quick quiet safe second slow strong 
 surprised tall terrible third weak well wet worse worst wrong fun """),
 'doing': ("Doing words", "orange", "#FFE0C7", """
 add clap climb complete count get give hide hit hold know like love make move need paint 
 point put say see show start stop take talk think try wait want bring build buy call carry 
 change choose count drop feed fix grow help hurt invite laugh lose mean send shout travel 
 get_dressed get_undressed be_called """),
 'small': ("Small words", "grey", "#E2E5EC", """
 about again all and any because both but down for from how into more most no not now of 
 off often only or out outside inside round some than then this that these those to too up 
 very what when where which who why with must shall would could can """),

 'hello': ("Saying hello and thank you", "yellow", "#FFE9A8", """
 hello hi goodbye bye please sorry pardon thank_you thanks wow hooray oh oh_dear OK 
 well_done don't_worry see_you me_too yes no excuse_me fantastic great cool come_on 
 all_right brilliant """),
 'me': ("Me and you", "purple", "#E7DCF7", """
 I me my mine you your yours he him his she her hers we us our ours they them their theirs 
 it its this that these those who whose what where which when why how many one another 
 someone something everyone everything nothing lots kind Mr Mrs Miss a an the """),
 'howwhen': ("How and when", "grey", "#E2E5EC", """
 badly carefully loudly quickly quietly slowly really again often only very too now then 
 along around at by of to from with next_to inside outside up down be have do come get make 
 take give say see know think want need let's so """),
}

EMOJI = {
 'animal':'🐾','bear':'🐻','bee':'🐝','bird':'🐦','cat':'🐱','chicken':'🐔','cow':'🐮','crocodile':'🐊',
 'dog':'🐕','donkey':'🫏','duck':'🦆','elephant':'🐘','fish':'🐟','frog':'🐸','giraffe':'🦒','goat':'🐐',
 'hippo':'🦛','horse':'🐴','jellyfish':'🪼','lizard':'🦎','monkey':'🐵','mouse':'🐭','pet':'🏠','sheep':'🐑',
 'snake':'🐍','spider':'🕷','tail':'🦴','tiger':'🐯','zebra':'🦓','zoo':'🎪','bat':'🦇','cage':'🪶',
 'dolphin':'🐬','fly':'🪰','kangaroo':'🦘','kitten':'🐈','lion':'🦁','panda':'🐼','parrot':'🦜',
 'penguin':'🐧','puppy':'🐕','rabbit':'🐰','shark':'🦈','snail':'🐌','whale':'🐳',
 'arm':'💪','body':'🧍','ear':'👂','eye':'👁','face':'😀','foot':'🦶','hair':'💇','hand':'✋','head':'🧠',
 'leg':'🦵','mouth':'👄','nose':'👃','smile':'😊','back':'🔙','beard':'🧔','neck':'🦒','shoulder':'💪',
 'stomach':'🫃','tooth':'🦷','teeth':'🦷','moustache':'👨',
 'bag':'👜','boots':'🥾','clothes':'👕','dress':'👗','glasses':'👓','handbag':'👛','hat':'🎩','jacket':'🧥',
 'jeans':'👖','shirt':'👔','shoe':'👟','shorts':'🩳','skirt':'👗','sock':'🧦','trousers':'👖','coat':'🧥',
 'helmet':'⛑','scarf':'🧣','sweater':'🧶','swimsuit':'🩱',
 'baby':'👶','boy':'👦','girl':'👧','brother':'👦','sister':'👧','dad':'👨','mum':'👩','family':'👨‍👩‍👧',
 'friend':'🤝','grandma':'👵','grandpa':'👴','grandmother':'👵','grandfather':'👴','man':'👨','woman':'👩',
 'apple':'🍎','banana':'🍌','bread':'🍞','burger':'🍔','cake':'🎂','carrot':'🥕','chips':'🍟','chocolate':'🍫',
 'coconut':'🥥','egg':'🥚','fruit':'🍇','grape':'🍇','juice':'🧃','kiwi':'🥝','lemon':'🍋','lime':'🍋',
 'mango':'🥭','meat':'🍖','milk':'🥛','onion':'🧅','pea':'🫛','pear':'🍐','pie':'🥧','pineapple':'🍍',
 'potato':'🥔','rice':'🍚','sausage':'🌭','tomato':'🍅','watermelon':'🍉','bottle':'🍾','bowl':'🥣',
 'cheese':'🧀','coffee':'☕','cup':'🥤','glass':'🥛','milkshake':'🧋','noodles':'🍜','pancake':'🥞',
 'pasta':'🍝','picnic':'🧺','plate':'🍽','salad':'🥗','sandwich':'🥪','soup':'🍲','tea':'🍵','vegetable':'🥬',
 'ice cream':'🍦','breakfast':'🍳','lunch':'🥪','dinner':'🍽','candy':'🍬','sweet':'🍬','water':'💧',
 'doctor':'🩺','dentist':'🦷','hospital':'🏥','headache':'🤕','earache':'👂','cough':'😷','cold':'🤒',
 'temperature':'🌡','tired':'😴','ill':'🤢','cry':'😢','stomach-ache':'🤢','toothache':'🦷','hurt':'🤕',
 'bed':'🛏','bath':'🛁','chair':'🪑','clock':'🕐','computer':'💻','desk':'🪑','door':'🚪','garden':'🌷',
 'house':'🏠','home':'🏠','kitchen':'🍳','lamp':'💡','mirror':'🪞','phone':'📱','picture':'🖼','radio':'📻',
 'sofa':'🛋','table':'🪑','television':'📺','window':'🪟','camera':'📷','doll':'🪆','flower':'🌷','box':'📦',
 'towel':'🧻','toothbrush':'🪥','toothpaste':'🧴','blanket':'🛌','roof':'🏠','shower':'🚿','stairs':'🪜',
 'lift':'🛗','elevator':'🛗','internet':'🌐','message':'💬','map':'🗺','dream':'💭',
 'park':'🌳','shop':'🏪','street':'🛣','library':'📚','market':'🏪','supermarket':'🛒','cinema':'🎬',
 'circus':'🎪','funfair':'🎡','building':'🏢','station':'🚆','bus stop':'🚏','farm':'🚜','square':'🏛',
 'city':'🏙','town':'🏘','village':'🏡','bookshop':'📗','playground':'🛝','centre':'🏬',
 'book':'📖','pen':'🖊','pencil':'✏','crayon':'🖍','paper':'📄','ruler':'📏','eraser':'🧽','rubber':'🧽',
 'school':'🏫','teacher':'👩‍🏫','board':'📋','poster':'📃','letter':'🔤','alphabet':'🔠','question':'❓',
 'homework':'📝','music':'🎵','painting':'🎨','keyboard':'⌨','website':'🌐','text':'💬',
 'ball':'⚽','football':'⚽','basketball':'🏀','baseball':'⚾','badminton':'🏸','tennis':'🎾','hockey':'🏒',
 'beach':'🏖','bike':'🚲','boat':'⛵','guitar':'🎸','piano':'🎹','kite':'🪁','photo':'📸','swim':'🏊',
 'skate':'⛸','skateboard':'🛹','song':'🎶','sport':'🏅','party':'🎉','present':'🎁','film':'🎬','movie':'🎬',
 'comic':'📕','dance':'💃','video':'📹','CD':'💿','DVD':'📀','email':'📧','goal':'🥅','holiday':'🏖',
 'pool':'🏊','net':'🥅','band':'🎺',
 'morning':'🌅','afternoon':'🌇','evening':'🌆','night':'🌃','birthday':'🎂','day':'📅','year':'📆',
 'week':'📅','weekend':'🏖','today':'📌','yesterday':'⏪',
 'Monday':'1️⃣','Tuesday':'2️⃣','Wednesday':'3️⃣','Thursday':'4️⃣','Friday':'5️⃣','Saturday':'6️⃣','Sunday':'7️⃣',
 'alien':'👽','balloon':'🎈','car':'🚗','helicopter':'🚁','lorry':'🚚','monster':'👾','motorbike':'🏍',
 'plane':'✈','robot':'🤖','teddy':'🧸','train':'🚂','truck':'🚚','toy':'🧸','board game':'🎲','model':'🏗',
 'bus':'🚌','ship':'🚢','driver':'🧑‍✈️','ticket':'🎫','tractor':'🚜','trip':'🧳','travel':'🌍',
 'sun':'☀','cloud':'☁','rain':'🌧','rainbow':'🌈','snow':'❄','ice':'🧊','wind':'💨','sky':'🌌',
 'sunny':'🌞','cloudy':'🌥','windy':'🍃','weather':'🌦',
 'clown':'🤡','cook':'👨‍🍳','farmer':'🧑‍🌾','pirate':'🏴‍☠️','nurse':'🧑‍⚕️','work':'🛠',
 'sand':'🏜','sea':'🌊','shell':'🐚','tree':'🌳','forest':'🌲','grass':'🌿','island':'🏝','lake':'🏞',
 'leaf':'🍃','moon':'🌙','mountain':'⛰','plant':'🪴','river':'🏞','road':'🛣','rock':'🪨','star':'⭐',
 'waterfall':'💦','wave':'🌊','world':'🌍','jungle':'🌴','field':'🌾','countryside':'🌾','country':'🗺',
 'black':'⚫','blue':'🔵','brown':'🟤','green':'🟢','grey':'⚪','orange':'🟠','pink':'🩷','purple':'🟣',
 'red':'🔴','white':'⚪','yellow':'🟡','colour':'🎨',
 'happy':'😀','sad':'😢','angry':'😠','funny':'😄','scary':'😱','big':'🐘','small':'🐜','old':'👴',
 'new':'✨','hot':'🔥','clean':'🧼','dirty':'🧽','beautiful':'🌸','frightened':'😨','surprised':'😮',
 'hungry':'😋','thirsty':'🥤','asleep':'😴','awake':'😃','strong':'💪','brave':'🦁','quiet':'🤫','loud':'📢',
 'eat':'🍽','drink':'🥤','sleep':'😴','run':'🏃','jump':'🤸','walk':'🚶','sing':'🎤','draw':'✏','read':'📖',
 'write':'✍','play':'🎮','listen':'👂','look':'👀','swim ':'🏊','fly ':'🕊','climb':'🧗','laugh':'😆',
 'buy':'💳','cook ':'🍳','drive':'🚗','help':'🤝','wash':'🧼','ride':'🚴','catch':'🥎','throw':'🤾',
}



def esc(text):
    out = ''
    for ch in text:
        code = ord(ch)
        if ch == "'":
            out += "\\'"
        elif code < 127:
            out += ch
        elif code <= 0xFFFF:
            out += '\\u%04X' % code
        else:
            out += '\\u{%X}' % code
    return out


def rows_for(entries, themes):
    """Pagina de cada cromo, por este orden: lo que dice la tabla tematica de
    Cambridge; si no lista la palabra, la colocacion propia de THEMES; y si
    tampoco, la pagina que toca por marca gramatical (TAG_PAGE)."""
    theme_of, order = {}, []
    for tid, (label, colour, tint, block) in THEMES.items():
        order.append((tid, label, colour, tint))
        for word in block.split():
            theme_of[word.replace('_', ' ').lower()] = tid
    order.append(('things', 'More things', 'brown', '#EADBCB'))

    pages = {tid: [] for tid, *_ in order}
    for key, entry in sorted(entries.items()):
        tid = cambridge_page(key, themes) or theme_of.get(key)
        if not tid:
            first = re.split(r"\s*\+\s*", entry['tag'])[0].split(' ')[0]
            tid = TAG_PAGE.get(first, 'things')
        pages.setdefault(tid, []).append(entry['word'])

    rows = []
    for tid, label, colour, tint in order:
        if not pages.get(tid):
            continue    # una pagina sin cromos no se escribe (paso con "More things")
        items = [[w, EMOJI.get(w) or EMOJI.get(w.lower()) or '', 0] for w in pages.get(tid, [])]
        for item in items:
            item[2] = 1 if (item[1] and tid not in NO_PIC) else 0
        rows.append([tid, label, colour, tint, items])

    # Un icono no puede representar a dos palabras: Word hunt ensena cuatro
    # dibujos y el nino tiene que poder distinguirlos.
    by_icon = {}
    for ti, row in enumerate(rows):
        for ii, item in enumerate(row[4]):
            if item[2] == 1 and item[1]:
                by_icon.setdefault(item[1], []).append((ti, ii, item[0]))
    for icon, group in by_icon.items():
        if len(group) < 2:
            continue
        owner = OWNERS.get(icon)
        keep = next((g for g in group if g[2].lower() == owner), None) if owner else None
        if keep is None:
            keep = min(group, key=lambda g: (len(g[2]), g[2].lower()))
        for ti, ii, _ in group:
            if (ti, ii) != (keep[0], keep[1]):
                rows[ti][4][ii][2] = 0
    return rows


def write_files(entries, rows, spellings, themes):
    head = ["// Album generado DIRECTAMENTE del PDF oficial de Cambridge.",
            "// NO editar a mano: se cambia tools/build-wordlist.py y se regenera.",
            "// [palabra, icono, sirve para juegos de imagen]", "", "export const WORDS = {"]
    for tid, _, _, _, items in rows:
        head.append("  %s: [" % tid)
        cells = ["['%s', '%s', %d]" % (esc(w), esc(i), p) for w, i, p in items]
        for k in range(0, len(cells), 3):
            head.append('    ' + ', '.join(cells[k:k + 3]) + ',')
        head.append("  ],")
    head.append("};")
    head.append(WORDLIST_TAIL)
    (ROOT / 'src/data/wordlist.js').write_text('\n'.join(head))

    topics = ["import { wordsFor } from './wordlist.js';", "", "const DEFS = ["]
    for tid, label, colour, tint, _ in rows:
        topics.append("  { id: '%s', label: '%s', colour: '%s', tint: '%s' },"
                      % (tid, esc(label), colour, tint))
    topics.append("];")
    topics.append(TOPICS_TAIL)
    (ROOT / 'src/data/topics.js').write_text('\n'.join(topics))

    source = ["// Lista canonica del wordlist oficial, extraida con pdftotext.",
              "// Es la VERDAD contra la que se mide el album.",
              "// [entrada, marca gramatical, nivel] donde S = Starters, M = Movers.",
              "", "export const SOURCE_ENTRIES = ["]
    for entry in sorted(entries.values(), key=lambda e: e['word'].lower()):
        source.append("  ['%s', '%s', '%s'],"
                      % (esc(entry['word']), esc(entry['tag']), entry['level']))
    source.append("];")
    source.append("\nexport const sourceWords = () => SOURCE_ENTRIES.map(([word]) => word);")
    source.append("")
    source.append("// Tabla tematica del mismo PDF: que paginas del album admite Cambridge para")
    source.append("// cada palabra que clasifica por tema. Un cromo tiene que estar en una de")
    source.append("// ellas (comprobacion 3). Las palabras que no aparecen aqui no las clasifica")
    source.append("// Cambridge y las coloca la app por criterio propio.")
    source.append("export const THEMATIC = [")
    for key in sorted(themes):
        pages = [CATEGORY_PAGE[c] for c in themes[key] if CATEGORY_PAGE.get(c)]
        if pages:
            source.append("  ['%s', [%s]]," % (esc(entries[key]['word']), ', '.join("'%s'" % t for t in pages)))
    source.append("];")
    source.append("")
    (ROOT / 'src/data/wordlist-source.js').write_text('\n'.join(source))

    def fmt(words, per=8):
        out, line = [], []
        for word in words:
            line.append("'" + esc(word) + "'")
            if len(line) == per:
                out.append('  ' + ', '.join(line) + ',')
                line = []
        if line:
            out.append('  ' + ', '.join(line) + ',')
        return '\n'.join(out)

    def tokens(level):
        # Se parte por espacios, no por guiones: "T-shirt" es una palabra, "t" no.
        words = [e['word'] for e in entries.values() if e['level'] == level]
        words += sorted(spellings[level])
        return sorted({p.lower() for w in words for p in w.split(' ') if p})

    syl = (ROOT / 'src/data/syllabus.js').read_text()
    syl = re.sub(r"export const STARTERS_WORDS = \[.*?\];",
                 lambda m: "export const STARTERS_WORDS = [\n%s\n];" % fmt(tokens('S')),
                 syl, flags=re.S)
    syl = re.sub(r"export const MOVERS_WORDS = \[.*?\];",
                 lambda m: "export const MOVERS_WORDS = [\n%s\n];" % fmt(tokens('M')),
                 syl, flags=re.S)
    (ROOT / 'src/data/syllabus.js').write_text(syl)


WORDLIST_TAIL = """
export function wordsFor(topicId) {
  return (WORDS[topicId] ?? []).map(([word, icon, pic]) => ({
    id: word, word, icon, pic: pic === 1,
  }));
}

export function allPicturable() {
  return Object.entries(WORDS).flatMap(([topicId, list]) => list
    .filter(([, , pic]) => pic === 1)
    .map(([word, icon]) => ({ id: word, word, icon, pic: true, topicId })));
}
"""

TOPICS_TAIL = """
export const TOPICS = DEFS.map((def) => ({ ...def, words: wordsFor(def.id) }));

export const getTopic = (id) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];
"""

TAG_PAGE = {'adj': 'describing', 'v': 'doing', 'prep': 'small', 'conj': 'small',
            'det': 'small', 'pron': 'small', 'adv': 'small', 'int': 'me',
            'poss': 'me', 'dis': 'hello', 'excl': 'hello', 'title': 'me', 'n': 'things'}

NO_PIC = {'describing', 'doing', 'small', 'hello', 'me', 'howwhen', 'names', 'colours'}

OWNERS = {
 '\U0001F474': 'grandpa', '\U0001F37D': 'plate', '\u270F': 'pencil',   # no old, eat, draw
 '\U0001F415': 'dog', '\U0001F3E0': 'house', '\U0001F3AA': 'circus', '\U0001F4AA': 'arm',
 '\U0001F442': 'ear', '\U0001F468': 'man', '\U0001F9B7': 'tooth', '\U0001F457': 'dress',
 '\U0001F9E5': 'coat', '\U0001F456': 'jeans', '\U0001F466': 'boy', '\U0001F469': 'woman',
 '\U0001F3E5': 'hospital', '\U0001F3EA': 'shop', '\U0001F686': 'train', '\U0001F69A': 'lorry',
 '\U0001F35F': 'chips', '\U0001F36C': 'sweet', '\U0001F95B': 'milk', '\U0001F964': 'cup',
 '\U0001F3D6': 'beach', '\U0001F3DE': 'river', '\U0001F33E': 'field', '\U0001F30A': 'sea',
 '\U0001F4C5': 'day', '\U0001F3AC': 'film', '\U0001F3CA': 'swim', '\U000026F8': 'skate',
 '\U0001F6B2': 'bike', '\U0001F697': 'car', '\U0001F3EB': 'school', '\U0001F4D6': 'book',
 '\U0001F4F1': 'phone', '\U0001F3B5': 'music', '\U0001F3A8': 'painting', '\U0001F4A7': 'water',
}


# Casos que ya rompieron el extractor una vez. `--selftest` los repasa sin
# necesitar el PDF: si alguien toca las expresiones regulares, esto avisa.
SELFTEST = [
    (['her poss adj + pron'], [('her', 'poss adj + pron', ['her'])]),
    (['my poss adj'], [('my', 'poss adj', ['my'])]),
    (['band (music) n'], [('band (music)', 'n', ['band'])]),
    (['keyboard (computer) n'], [('keyboard (computer)', 'n', ['keyboard'])]),
    (['bat (as sports', 'equipment) n'], [('bat (as sports equipment)', 'n', ['bat'])]),
    (['X', '(No words at this level)', 'Y', 'yesterday adv + n'],
     [('yesterday', 'adv + n', ['yesterday'])]),
    (['take off (i.e. get undressed)', 'v'], [('take off (i.e. get undressed)', 'v', ['take off'])]),
    (['floor (e.g. ground, 1st, etc.)', 'n'], [('floor (e.g. ground, 1st, etc.)', 'n', ['floor'])]),
    (['could (as in past of can', 'for ability) v'],
     [('could (as in past of can for ability)', 'v', ['could'])]),
    (['colour (US color) n + v'], [('colour (US color)', 'n + v', ['colour'])]),
    (['mouse/mice n'], [('mouse/mice', 'n', ['mouse', 'mice'])]),
    (['sweet(s) (US candy) n'], [('sweet(s) (US candy)', 'n', ['sweet', 'sweets'])]),
    (['city/town centre', '(US center) n'], [('city/town centre (US center)', 'n', ['city centre', 'town centre'])]),
    (['have (got) to v'], [('have (got) to', 'v', ['have got to'])]),
    (['in prep of place + time'], [('in', 'prep of place + time', ['in'])]),
    (['a lot of det'], [('a lot of', 'det', ['a lot of'])]),
    (['Miss title'], [('Miss', 'title', ['Miss'])]),
    (['T-shirt n'], [('T-shirt', 'n', ['T-shirt'])]),
]


PAGE_SELFTEST = [
    ('bike', ['Sports & leisure', 'Toys', 'Transport'], 'transport'),
    ('ball', ['Sports & leisure', 'Toys'], 'sports'),
    ('doll', ['The home', 'Sports & leisure', 'Toys'], 'toys'),
    ('doctor', ['Health', 'Work'], 'work'),
    ('hospital', ['Health', 'Places & directions', 'Work'], 'places'),
    ('desk', ['The home', 'School'], 'home'),
    ('chicken', ['Animals', 'Food & drink'], 'animals'),
    ('swim', ['Sports & leisure', 'Transport'], 'sports'),
    ('tree', ['The home', 'The world around us'], 'world'),
    ('pair', ['Numbers'], None),
    ('paper', ['Materials', 'School'], 'school'),
    ('idea', [], None),
]


def selftest():
    failed = 0
    for word, cats, want in PAGE_SELFTEST:
        got = cambridge_page(word, {word: cats})
        if got != want:
            failed += 1
            print('FALLA pagina de %r con %r: esperado %r, obtenido %r' % (word, cats, want, got))
    for lines, expected in SELFTEST:
        got = [(raw, tag, clean(raw)[0]) for raw, tag in parse(lines)]
        if got != expected:
            failed += 1
            print('FALLA %r\n   esperado %r\n   obtenido %r' % (lines, expected, got))
    spell = clean('colour (US color) n + v'.rsplit(' n + v')[0])[1]
    if spell != ['color']:
        failed += 1
        print('FALLA grafias US: esperado [\'color\'], obtenido %r' % spell)
    print('selftest: %d casos, %d fallos' % (len(SELFTEST) + len(PAGE_SELFTEST) + 1, failed))
    sys.exit(1 if failed else 0)


def main():
    if len(sys.argv) < 2:
        sys.exit('uso: python3 tools/build-wordlist.py <wordlist.pdf>  |  --selftest')
    if sys.argv[1] == '--selftest':
        selftest()
    entries, spellings = extract(sys.argv[1])
    themes = thematic_table(pdf_words(sys.argv[1], *THEMATIC_PAGES), set(entries))
    if len(themes) < 550:
        sys.exit('la tabla tematica solo dio %d palabras; el lector se ha roto' % len(themes))
    rows = rows_for(entries, themes)
    write_files(entries, rows, spellings, themes)
    total = sum(len(r[4]) for r in rows)
    print('entradas extraidas del PDF : %d' % len(entries))
    print('palabras con tema oficial  : %d' % len(themes))
    print('cromos escritos en el album: %d' % total)
    if total != len(entries):
        print('AVISO: el album y el PDF no cuadran. Revisa la comprobacion 3.')
    print('')
    print('Ahora ejecuta: npm run check')


if __name__ == '__main__':
    main()
