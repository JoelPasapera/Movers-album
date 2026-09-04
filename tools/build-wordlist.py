#!/usr/bin/env python3
"""Genera el album desde el PDF oficial del wordlist de Cambridge.

    python3 tools/build-wordlist.py ruta/al/506166-starters-movers-flyers-word-list-2025.pdf

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
"""

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
ENDS = re.compile(r"\s(%s)(\s*\+\s*%s)*(\s+of\s+[\w\s+]+)?$" % (TAGS, TAGS))
NOISE = re.compile(r"(Pre A1 Starters|A1 Movers|A2 Flyers)\s*A.Z wordlist|\ufeff")
SKIP = re.compile(r"^(Grammatical key|Letters & numbers|Names|Numbers|Candidates|adjective|"
                  r"adverb|conjunction|determiner|discourse marker|exclamation|interrogative|"
                  r"noun|possessive|preposition|pronoun|verb|[A-Z]|\(No words|\d+)$")
PAREN = re.compile(r"\((?:as in|e\.g\.|i\.e\.|for)[^)]*\)")
OK = re.compile(r"^[A-Za-z\u00c0-\u017f][A-Za-z\u00c0-\u017f' \-]*$")

# Paginas del PDF: Starters 4-7, Movers 8-11.
PAGES = {'S': (4, 7), 'M': (8, 11)}


def pdf_lines(pdf, first, last):
    out = subprocess.run(['pdftotext', '-f', str(first), '-l', str(last), pdf, '-'],
                         capture_output=True, text=True, check=True)
    return out.stdout.splitlines()


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
    """Una entrada del PDF puede dar varios cromos: mouse/mice, colour (US color)."""
    e = PAREN.sub("", entry.replace('\u2019', "'").strip())
    e = re.sub(r"\(s \+ pl\)", "", e).strip()
    variants = []
    m = re.search(r"\((?:UK|US)\s+([^)]+)\)", e)
    if m:
        variants.append(m.group(1).strip())
        e = re.sub(r"\((?:UK|US)\s+[^)]+\)", "", e).strip()
    m = re.fullmatch(r"([\w']+)\((\w+)\)", e)
    if m:
        variants.append(m.group(1) + m.group(2))
        e = m.group(1)
    e = re.sub(r"\s+", " ", e.replace('(', ' ').replace(')', ' ')).strip()
    heads = []
    if '/' in e:
        pre = e.split('/')[0].split(' ')
        for i, part in enumerate(e.split('/')):
            part = part.strip()
            heads.append(part if i == 0 or len(pre) == 1 else ' '.join(pre[:-1] + [part]))
    else:
        heads.append(e)
    return [h for h in dict.fromkeys(heads + variants) if h and OK.match(h)]


def extract(pdf):
    entries = {}
    for level, (first, last) in PAGES.items():
        for raw, tag in parse(pdf_lines(pdf, first, last)):
            for head in clean(raw):
                key = head.lower()
                if key in TAG_WORDS or key in entries:
                    continue
                entries[key] = {'word': head, 'tag': tag, 'level': level}
    return entries


THEMES = {
 'animals': ("Animals", "green", "#CDEBD3", """
 animal bear bee bird cat chicken cow crocodile dog donkey duck elephant fish frog giraffe
 goat hippo horse jellyfish lizard monkey mouse mice pet sheep snake spider tail tiger zebra zoo
 bat cage dolphin fly kangaroo kitten lion panda parrot penguin puppy rabbit shark snail whale polar_bear """),
 'body': ("The body and the face", "pink", "#FBD9E6", """
 arm body ear eye face foot feet hair hand head leg mouth nose smile
 back beard blonde curly fair fat moustache neck shoulder stomach thin tooth teeth"""),
 'clothes': ("Clothes", "purple", "#E7DCF7", """
 bag boots clothes dress glasses handbag hat jacket jeans shirt shoe shorts skirt sock
 trousers wear coat helmet scarf sweater swimsuit pair baseball_cap T-shirt cap """),
 'colours': ("Colours", "red", "#FBD7D4", """
 black blue brown colour green grey orange pink purple red white yellow color gray favourite favorite centre center """),
 'family': ("Family and friends", "orange", "#FFE0C7", """
 baby boy brother child children classmate cousin dad family father friend girl grandfather
 grandma grandmother grandpa kid man men mother mum person people sister woman women
 aunt daughter granddaughter grandparent grandson son uncle parent grown-up """),
 'food': ("Food and drink", "yellow", "#FFE9A8", """
 apple banana bean bread breakfast burger cake candy carrot chips chocolate coconut dinner
 drink eat egg food fries fruit grape juice kiwi lemon lemonade lime lunch mango meat
 meatballs milk onion pea pear pie pineapple potato rice sausage sweet tomato water watermelon
 bottle bowl cheese coffee cup glass hungry milkshake noodles pancake pasta picnic plate salad
 sandwich sauce soup tea thirsty vegetable ice_cream sweets cream """),
 'health': ("Health", "red", "#FBD7D4", """
 cold cough cry dentist doctor earache fall fine headache hospital ill matter nurse sick
 stomach-ache temperature tired toothache hurt"""),
 'home': ("The home", "brown", "#EADBCB", """
 apartment armchair bath bathroom bed bedroom bookcase box chair clock computer cupboard desk
 door flat garden hall home house kitchen lamp mat mirror phone picture radio room rug sleep
 sofa table television toy wall watch window camera doll flower
 address balcony basement blanket downstairs dream elevator floor internet lift message roof
 seat shower stair stairs toothbrush toothpaste towel upstairs wash dining_room living_room app laptop tablet e-book machine  TV """),
 'names': ("Names", "grey", "#E2E5EC", """
 Alex Alice Anna Ben Bill Dan Eva Grace Hugo Jill Kim Lucy Mark Matt May Nick Pat Sam Sue Tom
 Charlie Clare Daisy Fred Jack Jane Jim Julia Lily Mary Paul Peter Sally Vicky Zoe Ann """),
 'places': ("Places and directions", "purple", "#E7DCF7", """
 behind between bookshop end here front park playground shop store street there under
 above below building bus station bus stop centre cinema circle circus city farm funfair
 library map market near opposite place square station straight supermarket town village bus_station shopping_centre sports_centre swimming_pool car_park top bottom  café """),
 'school': ("School", "blue", "#D7E6FB", """
 alphabet answer ask board book class classroom close correct crayon cross draw English eraser
 example find learn lesson letter line listen look music number open page painting paper part
 pen pencil poster question read right rubber ruler school sentence sit spell stand story
 teacher tell tick understand word write keyboard break homework mistake teach text website e-book noise shape thing name idea difference """),
 'sports': ("Sports and leisure", "green", "#CDEBD3", """
 badminton ball baseball basketball beach bike boat bounce catch drawing enjoy favourite
 fishing football game guitar hobby hockey jump kick kite photo piano play ride run sing
 skateboard skateboarding soccer song sport swim tennis throw walk
 band CD comic dance DVD email film goal holiday hop party player pool practice practise
 present score skate skip video movie net tennis_racket roller_skates roller_skating ice_skates ice_skating skateboarding swimming_pool sports_centre treasure """),
 'time': ("Days and time", "blue", "#D7E6FB", """
 afternoon birthday day evening morning night today year
 after always before every never sometimes week weekend yesterday
 Monday Tuesday Wednesday Thursday Friday Saturday Sunday o'clock age hundred """),
 'toys': ("Toys", "orange", "#FFE0C7", """
 alien balloon board game car helicopter lorry monster motorbike plane robot teddy train
 truck model kite ball doll"""),
 'transport': ("Transport", "brown", "#EADBCB", """
 bus drive fly ship train ride driver station ticket tractor trip travel bike boat car plane"""),
 'weather': ("Weather", "blue", "#D7E6FB", """
 sun cloud cloudy ice rain rainbow sky snow sunny weather wind windy"""),
 'work': ("Jobs and work", "grey", "#E2E5EC", """
 teacher clown cook farmer pirate work film star pop star driver doctor nurse dentist"""),
 'world': ("The world around us", "green", "#CDEBD3", """
 sand sea shell tree water country countryside field forest grass ground island lake leaf
 leaves moon mountain plant river road rock star town waterfall wave world jungle"""),
 'describing': ("Describing words", "pink", "#FBD9E6", """
 angry beautiful big clean closed cool correct dirty double fantastic funny good great happy
 long new nice old open sad scary short silly small ugly young
 afraid asleep awake bad best better boring brave brilliant busy careful clever dangerous
 different difficult dry easy exciting famous fine first frightened hot huge last little loud
 naughty pretty quick quiet safe second slow square strong surprised sweet tall terrible
 third weak well wet worse worst wrong blonde blond fun """),
 'doing': ("Doing words", "orange", "#FFE0C7", """
 add bounce clap climb complete count draw drink eat enjoy find fly get give go hide hit hold
 jump kick know learn like listen live look love make move need open paint phone pick play
 point put read ride run say see show sing sit sleep smile spell stand start stop swim take
 talk tell think throw tick try understand wait wake walk want wash watch wave wear write
 bring build buy call carry catch change choose cook count cry dance drive drop feed fix grow
 help hop hurt invite laugh lose mean plant practise sail score send shop shout skate skip
 teach travel get_dressed get_undressed be_called go_shopping """),
 'small': ("Small words", "grey", "#E2E5EC", """
 about again all also and any because both but down each every for from how into just more
 most much near next no not now of off often only or out outside inside round some than then
 there this that these those to too under up very what when where which who why with without
 always must shall should would could can"""),

 'hello': ("Saying hello and thank you", "yellow", "#FFE9A8", """
 hello hi goodbye bye please sorry pardon thank_you thanks wow hooray oh oh_dear OK
 well_done don't_worry see_you me_too here_you_are yes no excuse_me fantastic great cool
 dear come_on all_right brilliant fine"""),
 'me': ("Me and you", "purple", "#E7DCF7", """
 I me my mine you your yours he him his she her hers we us our ours they them their theirs
 it its this that these those who whose what where which when why how many one another
 someone something everyone everything nothing lot lots kind Mr Mrs Miss a an the """),
 'howwhen': ("How and when", "grey", "#E2E5EC", """
 badly carefully loudly quickly quietly slowly really again always never sometimes often
 only just also very too now then along around at by in on of to from with under over
 between behind near next_to in_front_of opposite above below inside outside up down
 be have do go come get make take give say see know think want need let's so  got """),
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


def rows_for(entries):
    theme_of, order = {}, []
    for tid, (label, colour, tint, block) in THEMES.items():
        order.append((tid, label, colour, tint))
        for word in block.split():
            theme_of[word.replace('_', ' ').lower()] = tid
    order.append(('things', 'More things', 'brown', '#EADBCB'))

    pages = {tid: [] for tid, *_ in order}
    for key, entry in sorted(entries.items()):
        tid = theme_of.get(key)
        if not tid:
            first = re.split(r"\s*\+\s*", entry['tag'])[0].split(' ')[0]
            tid = TAG_PAGE.get(first, 'things')
        pages.setdefault(tid, []).append(entry['word'])

    rows = []
    for tid, label, colour, tint in order:
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


def write_files(entries, rows):
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
    source.append("\nexport const sourceWords = () => SOURCE_ENTRIES.map(([word]) => word);\n")
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
        return sorted({p.lower() for e in entries.values() if e['level'] == level
                       for p in re.split(r"[ \-]", e['word']) if p})

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


def main():
    if len(sys.argv) < 2:
        sys.exit('uso: python3 tools/build-wordlist.py <wordlist.pdf>')
    entries = extract(sys.argv[1])
    rows = rows_for(entries)
    write_files(entries, rows)
    total = sum(len(r[4]) for r in rows)
    print('entradas extraidas del PDF : %d' % len(entries))
    print('cromos escritos en el album: %d' % total)
    if total != len(entries):
        print('AVISO: el album y el PDF no cuadran. Revisa la comprobacion 3.')
    print('')
    print('Ahora ejecuta: npm run check')


if __name__ == '__main__':
    main()
