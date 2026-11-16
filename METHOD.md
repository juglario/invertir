# Method: "Invertir desde cero / Investing from Zero"

The reusable how. Written so the next lesson, the next language, or the next calculator can be added without re-deriving any of this.

---

## 1. Writing standard (high-school level)

- **One idea per lesson.** If a lesson needs two big ideas, it is two lessons.
- **Every term is defined the first time it appears, in bold, in plain words.** "A bond is a loan" before any other sentence about bonds.
- **Concrete before abstract.** Open with a thing a teenager can picture (a candy bar getting more expensive, four friends opening an ice cream shop), then name the concept.
- **One analogy per lesson,** in its own "think of it like this" box. Analogies come from everyday life (escalators, the gym, soccer, a snowball), not from finance.
- **Short.** Roughly 150-250 words of body per lesson. The book carries the depth.
- **No em dashes anywhere** (Owner style rule for all office prose). Commas, colons, periods, parentheses.
- **Spanish uses rioplatense voseo** ("ahorrá", "elegí"), same as the book. English is plain American English.
- **Localize examples, not concepts.** The Spanish version can use an alfajor and an 80% credit-card rate; the English version uses pizza and a 25% card rate. The lesson teaches the same thing in both.
- **Every number must be checkable.** Any figure in a lesson (91,000 after a year of 10% inflation, doubling in ~7 years at 10%) is recomputed in the build log before shipping.
- **No promises.** Calculator outputs are labeled as examples; assumptions are printed on screen; the footer disclaimer says this is education, not personalized advice.

## 1b. Depth and reading time (v2)

- **Target: ~20 minutes of lesson prose per language at 220 wpm (~4,400 words), ~2 minutes per lesson.** Quizzes are extra.
- Each lesson = core (`content.js`: one-line summary, 3-5 short paragraphs, analogy) + **depth layer** (`deep.js`: exactly 3 paragraphs). The three depth paragraphs each do one job: **the mechanism** (why it works), **a worked example with real numbers**, or **the limit / common mistake**. They read as one continuous body; there is no "advanced" label.
- Reading time is computed live from the text (`words / 220`, rounded, min 1), so adding or cutting copy keeps the hero and lesson badges honest without manual edits.
- External facts are stated conservatively and only when they are well established (see the source list in `BUILDLOG.md` session 2). If a figure is not solid, cut it rather than soften it into vagueness.

## 1c. Visual system (v2)

- One scroll: hero → part divider → lessons → … → summary. No router; lessons are anchors.
- System fonts only (no network): serif display (Iowan Old Style / Charter / Georgia), system sans body, system mono labels. Paper `#f3efe6`, ink `#121210`, one signal color `#ff5a1f` reserved for emphasis and interaction.
- Signature elements: outlined oversized numerals (lessons in arabic, parts in roman), full-bleed ink part dividers, a pull-quote "in one sentence" with a signal rule, analogies on a tinted card, calculators as dark instruments with slider + editable number and large tabular readouts.
- **One calculator per scroll**, placed at its most relevant lesson. Do not embed the same instrument twice.
- Motion: reveal-on-scroll and the hero curve draw only; all disabled under `prefers-reduced-motion` and when IntersectionObserver is unavailable (content shows immediately).

## 1d. Rules for "La casa siempre gana" (kids anti-gambling page)

Non-negotiable, from the UX evidence review (BUILDLOG session 3):
- **Gambling simulations must be boring.** No celebration on wins (no lights, sound, confetti or exclamation marks), no staged near-misses, net result always visible, a long-run button (10,000 spins) available from the start, and a reflection prompt at the end. If a kid tester says the slot was fun, that is a bug.
- **Pick numbers so the lesson survives randomness.** Any demo a kid can rerun must show the house winning in essentially every run (target: P(player ahead) well under 1% for the long-run view). Compute it before shipping; the 50× jackpot draft failed this.
- **Rounded numbers must add up the way a kid would add them** (the 67+25+17 = 109 lesson).
- **Every risk message comes with an action** (who to tell, what to say, which line to call). No fear without efficacy, no moralizing, no shaming ("es de giles" is banned).
- **Help lines:** publish only numbers verified on an official government or program source, record the source and date in the build log, and re-verify all of them before any public launch and at least once a year. Lead with the national line; build the help section for the "it's my friend" case first.
- No mascots, no stock "sad teen" imagery, no real casino or betting brands.

## 1e. Independent entries ("puertas de entrada")

- **One page per audience, standalone.** Each entry must make sense to someone who never sees the main site: its own hook, its own data, its own calculator, its own action plan, and links out to the main site and the other entries at the end.
- **Structure:** dark hero that sells the dream, with a chart that *is* the thesis (not decoration) → the honest data (myth vs measured, with sources on the page) → 3-4 mechanism ideas → calculator → six trap flip cards ("what they'll tell you / what to do") → 8-step 90-day checklist → team / protections where relevant → close.
- **Engine:** pages declare `data-hero` (spike | jagged | windfall), `data-calc` (lifetime | salary | freedom) with JSON `data-defaults`, `.flip` cards and a `.plan` list; `vp.js` wires what is present. New audience = new HTML file, no engine change, unless it needs a new chart or calculator.
- **Every number in the copy is asserted by a test** against the engine (the creator-pattern and $1,200-vs-$900 mistakes were both caught this way). Calibrate demos so the lesson appears with the default inputs (e.g. paying yourself 100% must visibly break the cushion).
- **Debunk with care:** when a famous stat is wrong (the "78% of NFL players go broke" figure), show the myth next to the measured number and cite both; never replace one unsourced number with another.
- **Never** reference this office's own clients or portfolios; keep the entries generic and shareable.

## 2. Lesson anatomy

Every lesson object in `site/content.js` has the same shape, per language:

```
{ id, part, chapters: [bookChapter...], tool: 'compound'|'inflation'|'emergency'|'portfolio'|null,
  es: { title, oneLine, body: [paragraph...], analogy, quiz: [{ q, options, answer, why }] },
  en: { ...same shape... } }
```

Rules enforced by the integrity check (see §5): both languages present, same number of body paragraphs and quiz questions, same correct-answer index per question in both languages, every `chapters` entry exists in `CHAPTERS`, every `tool` is one of the four calculators.

## 3. Book mapping

Lesson N maps to book chapter N, with two deliberate exceptions where the arcs differ:

| Lesson | Book |
|---|---|
| 3 "How to save without suffering" | Epilogue (step 1, "ahorrá"). The book has no dedicated saving-habits chapter; this lesson was added because the Owner asked for "savings" explicitly. |
| 8 "Do not put all your eggs in one basket" | Chapters 7 + 8 (the book splits why vs how much). |
| 12 "Your first step" | Chapter 12 + Epilogue. |

Chapter titles stay in Spanish in both languages (the book is in Spanish); the English site adds a translated gloss.

## 4. Calculator assumptions (shown to the reader verbatim)

- **Compound interest:** monthly contributions, compounding monthly at the monthly equivalent of the yearly rate, `(1 + r)^(1/12) - 1`.
- **Inflation:** purchasing power `amount / (1 + i)^years`; future price `amount * (1 + i)^years`.
- **Emergency fund:** target = monthly expenses x months to cover; time = ceil(missing / monthly saving).
- **Portfolio builder:** inflation-adjusted long-run US averages, rounded: stocks ~7%/yr, bonds ~2%, cash ~0%. "Very bad year" = calendar 2008: stocks -37%, high-quality bonds +5%, cash 0%. Chosen deliberately because it shows bonds doing their cushioning job, which is what lesson 6 claims. Not a forecast, and the screen says so.

## 5. Verification (run before every ship)

From `site/`:
1. `node --check app.js && node --check content.js`
2. Em-dash scan across all site files must return nothing.
3. Content integrity script (see the 2026-11-11 build log entry for the exact script): 12 lessons, es/en aligned, valid chapter refs and quiz answers.
4. Recompute every number quoted in lesson copy.
5. Render check in a real browser (headless Chrome screenshot of home, one lesson, and the calculators page).

## 6. Security and privacy posture

- No network requests, no third-party scripts or fonts, no cookies. Progress and language live in `localStorage` only, wrapped in try/catch (it can throw in private mode).
- All `innerHTML` writes take only static copy from `content.js`; every number derived from reader input is written with `textContent`. Numeric inputs are parsed with `parseFloat`, rejected if non-finite, and clamped to each input's own min/max.
- **CSP:** deliberately not set via `<meta>` in v1, because some browsers treat `file://` pages as opaque origins and a `script-src 'self'` policy would block the site's own scripts when opened from disk. On GitHub Pages (served from the separate public repo `invertir-desde-cero`, no custom headers) `build_pages.py` injects it as a `<meta>` when building that repo, minus `frame-ancestors`, which only works as a header. On any other host, set it as a response header: `default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`.

## 7. Adding things later

- **A new lesson:** add one object to `LESSONS` (both languages), pick its part and book chapter, run §5. No other file changes.
- **A new language:** add a `UI.<code>` block, a `<code>` key on every part, chapter gloss and lesson, and extend the toggle in `app.js` from a two-way switch to a menu.
- **A new calculator:** add a builder in `app.js`, register its name in `buildTool` and in the integrity script's tool list, state its assumptions on screen and in §4.

## 8. Academy lectures (`site/academia.html`)

The school page adapts Academy concepts for the site's reader. Shared rules: Spanish voseo, explain every term, no client, office or persona references, no held positions, numbers recomputed, claims the Academy marks as unverified either attributed or softened. When an Academy concept is enriched, run `python3 -I check_lectures.py`; a STALE line means the lecture should be re-read against the concept and its `data-updated` bumped. New written concepts appear under "no lecture yet" and are candidates for a new lecture, not an automatic one.



## 9. Languages

Every page exists in Spanish (rioplatense voseo), English and Brazilian Portuguese ("você"). Entry pages: `page.html`, `page-en.html`, `page-pt.html`, same ids and data-* hooks, each with the `nav.langs` switcher. The main site keeps one `index.html`; language via `?lang=es|en|pt`. Script strings live in per-language dictionaries in `app.js`/`content.js`/`deep.js`, `vp.js` and `la-casa.js`. Any copy change must land in all three versions; a new script string needs a key in all three dictionaries. Local adaptation is allowed (products, examples, help lines) but numbers and facts stay the same unless recomputed and logged.

## 10. The front page

`site/index*.html` are generated by `python3 -I portada.py` from the pages themselves (headlines, decks, lesson and lecture titles). Never edit them by hand: change the page, then re-run the script (and `build_pages.py` to publish). The issue number and date are the generation date, like a printed edition. The lessons app lives at `lecciones.html`; link lessons as `lecciones.html?lang=xx#lesson-id`.

