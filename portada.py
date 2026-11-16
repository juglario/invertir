"""Generate the newspaper-style front page in three languages.

Writes site/index.html (es), site/index-en.html and site/index-pt.html.
Headlines and decks of the entry pages, the 12 lesson titles and the 15
lecture titles are read from the pages themselves, so the front page stays
in sync: re-run this after changing any page.

Usage: python3 -I portada.py
"""
import datetime
import html
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent / "site"
LAUNCH = datetime.date(2026, 11, 11)  # first edition (site chartered)

LANGS = {
    "es": {"suffix": "", "html": "es"},
    "en": {"suffix": "-en", "html": "en"},
    "pt": {"suffix": "-pt", "html": "pt-BR"},
}

WEEKDAYS = {
    "es": ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "pt": ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"],
}
MONTHS = {
    "es": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "pt": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
}

T = {
    "es": {
        "title": "Invertir desde cero: el diario de tu plata",
        "description": "La portada de Invertir desde cero: una guía para empezar, doce lecciones, quince lecturas, calculadoras y secciones para futbolistas, creadores, plata de golpe y chicos.",
        "masthead": "Invertir desde cero", "motto": "El diario de tu plata",
        "ear_l": "Edición en español · Gratis · Sin publicidad · Sin cookies",
        "ear_r": "Pronóstico: corto plazo, nublado. Largo plazo, despejado con interés compuesto.",
        "issue": "Año I · N.º {n}", "slogan": "Educación financiera, no consejos de inversión",
        "lang_label": "Idioma",
        "k_lead": "Editorial", "k_course": "El curso", "k_school": "Suplemento", "k_sports": "Deportes",
        "k_digital": "Vida digital", "k_money": "Economía personal", "k_kids": "Para los más chicos",
        "k_tools": "Herramientas", "k_lessons": "Las doce lecciones", "k_lectures": "Lecturas de la escuela",
        "read_guide": "Leer la guía →", "read_course": "Empezar el curso →", "read_school": "Leer el suplemento →", "read": "Leer →",
        "min": "{n} min de lectura",
        "course_h": "Doce lecciones para pasar de cero a tu <em>primer portafolio.</em>",
        "course_d": "De por qué la plata pierde valor hasta tu primer paso, con calculadoras y preguntas para comprobar que entendiste.",
        "kids_h": "La casa <em>siempre gana.</em>",
        "kids_d": "Para chicos de 12: una tragamonedas, una ruleta y un quiz para ver con números por qué en las apuestas el que gana es siempre la casa.",
        "tools_d": "Calculadoras que corren en tu navegador. No guardan ni mandan nada.",
        "tools": [
            ("¿A qué edad llegás a tu meta?", "empezar"), ("Cuánto vale tu plata dentro de unos años", "L:inflacion"),
            ("Tu fondo de emergencia", "L:colchon"), ("El interés compuesto, año por año", "L:interes-compuesto"),
            ("Armá tu portafolio y miralo en un año malo", "L:portafolio"), ("Ganás mucho en pocos años: ¿cuánto podés gastar?", "futbolistas"),
            ("Pagate un sueldo con ingresos que suben y bajan", "creadores"), ("Tu número de libertad", "de-golpe"),
            ("La tragamonedas honesta", "la-casa"),
        ],
        "all_lessons": "Ver el curso completo →", "all_lectures": "Ver las quince lecturas →",
        "levels": {"101": "Fundamentos", "201": "Construir un portafolio", "301": "Analizar sin engañarte", "401": "Decisiones grandes"},
        "footer": "Invertir desde cero es un proyecto de educación financiera. Nada de lo que se publica acá es una recomendación personal de inversión. Sin publicidad, sin cookies y sin registro: tu progreso queda solo en tu navegador.",
    },
    "en": {
        "title": "Investing from Zero: the newspaper for your money",
        "description": "The front page of Investing from Zero: a getting-started guide, twelve lessons, fifteen readings, calculators, and sections for footballers, creators, sudden money and kids.",
        "masthead": "Investing from Zero", "motto": "The newspaper for your money",
        "ear_l": "English edition · Free · No ads · No cookies",
        "ear_r": "Forecast: short term, cloudy. Long term, clear skies with compound interest.",
        "issue": "Year I · No. {n}", "slogan": "Financial education, not investment advice",
        "lang_label": "Language",
        "k_lead": "Editorial", "k_course": "The course", "k_school": "Supplement", "k_sports": "Sports",
        "k_digital": "Digital life", "k_money": "Personal finance", "k_kids": "For younger readers",
        "k_tools": "Tools", "k_lessons": "The twelve lessons", "k_lectures": "Readings from the School",
        "read_guide": "Read the guide →", "read_course": "Start the course →", "read_school": "Read the supplement →", "read": "Read →",
        "min": "{n} min read",
        "course_h": "Twelve lessons to go from zero to your <em>first portfolio.</em>",
        "course_d": "From why money loses value to your first step, with calculators and quick questions to check you understood.",
        "kids_h": "The house <em>always wins.</em>",
        "kids_d": "For 12-year-olds: a slot machine, a roulette wheel and a quiz that show with real numbers why, in gambling, the house is always the one that wins.",
        "tools_d": "Calculators that run in your browser. They do not save or send anything.",
        "tools": [
            ("At what age do you reach your goal?", "empezar"), ("What your money will be worth in a few years", "L:inflacion"),
            ("Your emergency fund", "L:colchon"), ("Compound interest, year by year", "L:interes-compuesto"),
            ("Build your portfolio and see it in a bad year", "L:portafolio"), ("You earn a lot in a few years: how much can you spend?", "futbolistas"),
            ("Pay yourself a salary when income goes up and down", "creadores"), ("Your freedom number", "de-golpe"),
            ("The honest slot machine", "la-casa"),
        ],
        "all_lessons": "See the full course →", "all_lectures": "See all fifteen readings →",
        "levels": {"101": "Foundations", "201": "Building a portfolio", "301": "Analysis without fooling yourself", "401": "Big decisions"},
        "footer": "Investing from Zero is a financial education project. Nothing published here is personal investment advice. No ads, no cookies and no sign-up: your progress stays in your browser only.",
    },
    "pt": {
        "title": "Investir do zero: o jornal do seu dinheiro",
        "description": "A capa do Investir do zero: um guia para começar, doze lições, quinze leituras, calculadoras e seções para jogadores de futebol, criadores, dinheiro de repente e crianças.",
        "masthead": "Investir do zero", "motto": "O jornal do seu dinheiro",
        "ear_l": "Edição em português · Grátis · Sem anúncios · Sem cookies",
        "ear_r": "Previsão: curto prazo, nublado. Longo prazo, céu limpo com juros compostos.",
        "issue": "Ano I · N.º {n}", "slogan": "Educação financeira, não recomendação de investimento",
        "lang_label": "Idioma",
        "k_lead": "Editorial", "k_course": "O curso", "k_school": "Suplemento", "k_sports": "Esportes",
        "k_digital": "Vida digital", "k_money": "Finanças pessoais", "k_kids": "Para os mais novos",
        "k_tools": "Ferramentas", "k_lessons": "As doze lições", "k_lectures": "Leituras da Escola",
        "read_guide": "Ler o guia →", "read_course": "Começar o curso →", "read_school": "Ler o suplemento →", "read": "Ler →",
        "min": "{n} min de leitura",
        "course_h": "Doze lições para ir do zero ao seu <em>primeiro portfólio.</em>",
        "course_d": "De por que o dinheiro perde valor até o seu primeiro passo, com calculadoras e perguntas rápidas para conferir se você entendeu.",
        "kids_h": "A casa <em>sempre ganha.</em>",
        "kids_d": "Para quem tem 12 anos: um caça-níquel, uma roleta e um quiz para ver com números por que, nas apostas, quem sempre ganha é a casa.",
        "tools_d": "Calculadoras que rodam no seu navegador. Elas não guardam nem enviam nada.",
        "tools": [
            ("Com que idade você chega à sua meta?", "empezar"), ("Quanto vai valer o seu dinheiro daqui a alguns anos", "L:inflacion"),
            ("Sua reserva de emergência", "L:colchon"), ("Juros compostos, ano a ano", "L:interes-compuesto"),
            ("Monte seu portfólio e veja como ele fica num ano ruim", "L:portafolio"), ("Você ganha muito em poucos anos: quanto pode gastar?", "futbolistas"),
            ("Pague um salário a você mesmo com uma renda que sobe e desce", "creadores"), ("Seu número da liberdade", "de-golpe"),
            ("O caça-níquel honesto", "la-casa"),
        ],
        "all_lessons": "Ver o curso completo →", "all_lectures": "Ver as quinze leituras →",
        "levels": {"101": "Fundamentos", "201": "Montar um portfólio", "301": "Analisar sem se enganar", "401": "Grandes decisões"},
        "footer": "Investir do zero é um projeto de educação financeira. Nada do que é publicado aqui é recomendação pessoal de investimento. Sem anúncios, sem cookies e sem cadastro: o seu progresso fica só no seu navegador.",
    },
}

SECTIONS = [  # (page, kicker key, minutes)
    ("futbolistas", "k_sports", 7),
    ("creadores", "k_digital", 6),
    ("de-golpe", "k_money", 6),
]


def page_file(name, lang):
    return f"{name}{LANGS[lang]['suffix']}.html"


def lessons_href(lang, anchor=""):
    q = "" if lang == "es" else f"?lang={lang}"
    return f"lecciones.html{q}" + (f"#{anchor}" if anchor else "")


def headline_and_deck(name, lang):
    src = (SITE / page_file(name, lang)).read_text(encoding="utf-8")
    h1 = re.search(r"<h1>(.*?)</h1>", src, re.S)
    sub = re.search(r'<p class="sub">(.*?)</p>', src, re.S)
    if not h1 or not sub:
        raise SystemExit(f"{page_file(name, lang)}: missing <h1> or .sub")
    return h1.group(1).strip(), " ".join(sub.group(1).split())


def lesson_titles(lang):
    src = (SITE / "content.js").read_text(encoding="utf-8")
    blocks = re.split(r"\n    id: '", src)[1:]
    out = []
    for b in blocks:
        lid = b.split("'", 1)[0]
        m = re.search(lang + r": \{\s*title: (?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\")", b)
        if not m:
            raise SystemExit(f"content.js: no {lang} title for {lid}")
        raw = m.group(1) if m.group(1) is not None else m.group(2)
        out.append((lid, html.escape(raw.replace("\\'", "'").replace('\\"', '"'), quote=False)))
    return out


def lectures(lang):
    src = (SITE / page_file("academia", lang)).read_text(encoding="utf-8")
    found = re.findall(r'<article class="lec" id="([^"]+)".*?<p class="lec-meta">(\d{3})[^<]*</p>\s*<h3>(.*?)</h3>', src, re.S)
    if len(found) != 15:
        raise SystemExit(f"{page_file('academia', lang)}: expected 15 lectures, found {len(found)}")
    return found


def tool_href(target, lang):
    if target.startswith("L:"):
        return lessons_href(lang, target[2:])
    return page_file(target, lang) + ("#calculadora" if target == "empezar" else "")


def build(lang, today):
    t = T[lang]
    issue = (today - LAUNCH).days + 1
    date = f"{WEEKDAYS[lang][today.weekday()]}, {today.day} de {MONTHS[lang][today.month - 1]} de {today.year}"
    if lang == "en":
        date = f"{WEEKDAYS['en'][today.weekday()]}, {MONTHS['en'][today.month - 1]} {today.day}, {today.year}"
    date = date[0].upper() + date[1:]

    lead_h, lead_d = headline_and_deck("empezar", lang)
    school_h, school_d = headline_and_deck("academia", lang)

    def story(cls, kicker, href, head, deck, minutes, cta):
        return (
            f'      <article class="story {cls}">\n'
            f'        <p class="kicker">{kicker}</p>\n'
            f'        <h2><a href="{href}">{head}</a></h2>\n'
            f'        <p class="deck">{deck}</p>\n'
            f'        <p class="meta">{t["min"].format(n=minutes)} · <a href="{href}">{cta}</a></p>\n'
            f"      </article>\n"
        )

    sections = "".join(
        story("small", t[k], page_file(name, lang), *headline_and_deck(name, lang), m, t["read"])
        for name, k, m in SECTIONS
    )
    sections += story("small", t["k_kids"], page_file("la-casa", lang), t["kids_h"], t["kids_d"], 10, t["read"])

    tools = "".join(f'          <li><a href="{tool_href(target, lang)}">{label}</a></li>\n' for label, target in t["tools"])
    lessons = "".join(f'          <li><a href="{lessons_href(lang, lid)}">{title}</a></li>\n' for lid, title in lesson_titles(lang))

    by_level = {}
    for slug, level, title in lectures(lang):
        by_level.setdefault(level, []).append((slug, title))
    lecture_html = ""
    for level in sorted(by_level):
        lecture_html += f'          <li class="lvl-head"><span>{level}</span> {t["levels"][level]}</li>\n'
        lecture_html += "".join(
            f'          <li><a href="{page_file("academia", lang)}#{slug}">{title}</a></li>\n' for slug, title in by_level[level]
        )

    switch = "".join(
        f'<a href="{page_file("index", code)}" hreflang="{meta["html"]}" lang="{meta["html"]}"'
        + (' aria-current="page"' if code == lang else "")
        + f">{code.upper()}</a>"
        for code, meta in LANGS.items()
    )
    alternates = "".join(
        f'<link rel="alternate" hreflang="{meta["html"]}" href="{page_file("index", code)}">\n' for code, meta in LANGS.items()
    )

    return f"""<!DOCTYPE html>
<html lang="{LANGS[lang]['html']}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{html.escape(t['description'])}">
<title>{t['title']}</title>
{alternates}<link rel="stylesheet" href="portada.css">
</head>
<body>
<nav class="langs" aria-label="{t['lang_label']}">{switch}</nav>

<header class="mast">
  <div class="ears">
    <p class="ear">{t['ear_l']}</p>
    <p class="ear ear-r">{t['ear_r']}</p>
  </div>
  <h1 class="nameplate">{t['masthead']}</h1>
  <p class="motto">{t['motto']}</p>
  <p class="dateline"><span>{date}</span><span>{t['issue'].format(n=issue)}</span><span>{t['slogan']}</span></p>
</header>

<main class="front">
  <div class="top">
{story("lead", t["k_lead"], page_file("empezar", lang), lead_h, lead_d, 15, t["read_guide"])}      <aside class="box tools">
        <p class="kicker">{t['k_tools']}</p>
        <p class="box-d">{t['tools_d']}</p>
        <ul>
{tools}        </ul>
      </aside>
  </div>

  <div class="row two">
{story("mid", t["k_course"], lessons_href(lang), t["course_h"], t["course_d"], 20, t["read_course"])}{story("mid", t["k_school"], page_file("academia", lang), school_h, school_d, 25, t["read_school"])}  </div>

  <div class="row four">
{sections}  </div>

  <div class="row two lists">
      <section class="box">
        <p class="kicker">{t['k_lessons']}</p>
        <ol class="toc-list">
{lessons}        </ol>
        <p class="meta"><a href="{lessons_href(lang)}">{t['all_lessons']}</a></p>
      </section>
      <section class="box">
        <p class="kicker">{t['k_lectures']}</p>
        <ul class="toc-list lectures">
{lecture_html}        </ul>
        <p class="meta"><a href="{page_file('academia', lang)}">{t['all_lectures']}</a></p>
      </section>
  </div>
</main>

<footer class="colophon">
  <p>{t['footer']}</p>
</footer>
</body>
</html>
"""


def main():
    today = datetime.date.today()
    for lang in LANGS:
        out = SITE / page_file("index", lang)
        out.write_text(build(lang, today), encoding="utf-8")
        print(f"wrote {out.name}")


if __name__ == "__main__":
    main()
