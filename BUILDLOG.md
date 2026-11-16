# Build Log: "Invertir desde cero / Investing from Zero"

Newest first.

---

## 2026-11-16 — The front page ("la portada"), newspaper style, in three languages

**Owner:** "give me an index site for all of them too. kinda newspaper style."

**Built:** `site/index.html` (es), `index-en.html`, `index-pt.html`, styled by `site/portada.css` as a broadsheet: masthead with ears ("Pronóstico: corto plazo, nublado. Largo plazo, despejado con interés compuesto."), nameplate, motto "El diario de tu plata", dateline with weekday, date and issue number (Año I, counted from the 2026-11-11 launch). Lead story = the Empezar guide (Editorial, with a drop cap); a Tools box with nine calculators linked to the exact page or lesson; second row = the course and the School supplement; four sections (Sports = futbolistas, Digital life = creadores, Personal finance = de golpe, For younger readers = la casa); bottom row = the 12 lesson titles and the 15 lecture titles grouped by level. No scripts, no images, responsive to one column on phones.

**Generated, not hand-written:** `portada.py` reads each entry page's own `<h1>` and deck, the lesson titles from `content.js` and the lecture titles from `academia*.html`, so the front page cannot drift from the pages. Re-run it after any page change; it fails loudly if a page loses its headline or the School stops having 15 lectures. Only masthead copy, section names, la casa's headline (its own `<h1>` is the casino costume) and the tool labels live in the script, in all three languages.

**Moved:** the 12-lesson app is now `site/lecciones.html` (was `index.html`). Every entry page's back link ("← Invertir desde cero") now goes to the front page of its language; every other old `index.html` link (lesson anchors, "Las doce lecciones") goes to `lecciones.html` with the same `?lang=`. The lessons' brand link now returns to the front page (`pageFor('index')`).

**Verified:** 21 pages (7 × 3 languages): balanced HTML, correct `lang`, the CSP anchor present for `build_pages.py`, 447 internal links and anchors resolve, lesson links carry the right `?lang=`, no cross-language links outside the switcher, no em/en dashes. Visual rendering still unverified.

---

## 2026-11-15 — Three languages everywhere: Spanish, English, Brazilian Portuguese

**Owner:** "para todas las páginas hagamos versiones en inglés, portugués y español."

**Architecture:**
- Main site (`index.html`): already ES/EN; now ES/EN/PT. `content.js` gains `UI.pt`, `PARTS[].pt`, `CHAPTERS` pt glosses and `LESSONS[].pt`; `deep.js` gains `pt` for every lesson. `app.js`: a three-button selector (ES/EN/PT) replaces the toggle; language comes from `?lang=` (whitelisted es/en/pt, saved), then the saved choice, then the browser; `L()`/`t()` fall back to Spanish; `locale()` adds pt-BR; `money()` prints R$ for Portuguese (the PT lessons are written in reais); entry and guide links go to the language's own page (`pageFor()`); selecting a language rewrites `?lang=` with `history.replaceState` (fails quietly on file://); a link like `index.html?lang=pt#colchon` lands on the lesson.
- Entry pages: each exists as `page.html` (es), `page-en.html`, `page-pt.html`, with a fixed `nav.langs` switcher (ES/EN/PT, `aria-current` on the current page). All ids, classes and data-* hooks are identical across the three, so `vp.js`/`la-casa.js` work unchanged on every version.
- `vp.js` and `la-casa.js`: every visible string moved into an es/en/pt dictionary chosen from `<html lang>`; numbers formatted with the page locale. 95 keys in `vp.js`, identical across languages; `la-casa.js` quiz answers identical across languages.

**Translators:** six agents in parallel (empezar; academia; la-casa; futbolistas + creadores + de-golpe; content.js PT; deep.js PT), each to a shared spec. Code by Greg.

**Local adaptations (deliberate):**
- PT lessons use Brazilian references and R$ (pão de queijo, coxinha, Pix, Tesouro Direto/Selic, CDB, CVM); two peso-scale amounts rescaled with the same results (R$ 10.000 at 80% → R$ 18.000; R$ 25/h vs R$ 750 sneakers = 30 hours).
- Empezar PT is adapted to Brazil: BDRs and IVVB11 for the S&P 500, CDB com liquidez diária (FGC up to R$ 250 mil per CPF per institution, "confira a regra vigente") in place of cauciones, Tesouro Selic, debêntures in place of ONs, CVM-regulated broker; Plano Collor (1990) added beside the 2001 corralito. Empezar EN keeps the Argentine items labelled "If you are in Argentina" and says ETFs can be bought directly through a regulated broker.
- La casa: EN/PT relabel the Argentine help lines and add local ones on top (US: 1-800-GAMBLER; Brazil: CVV 188, SAMU 192, police 190). Legal line per language.

**Bug fixed on the way:** la-casa's button said "Girar 1.000 veces" but the code runs 10,000 spins (`BIG_RUN`); all three labels now say 10,000. Also caught by the language smoke test: a local `years` variable in the windfall hero shadowed the new `years()` helper (renamed `yearsTxt`/`monthsTxt`).

**Verified:** all 18 entry pages: balanced HTML, correct `lang`, switcher current page, identical ids and data-* across languages, every internal link and anchor resolves, index links carry the right `?lang=`, no cross-language links outside the switcher, no em/en dashes, no Nubank/NU. Main site: UI keys equal across es/en/pt (88), every lesson and depth entry has pt with matching shapes. Calculators and the three hero charts rendered against a fake DOM in es/en/pt (Spanish outputs unchanged: $36,941 / goal at 56); casino simulator and quiz run in all three. Visual rendering still unverified. Translations not reviewed by a native speaker.

---

## 2026-11-15 — "La escuela": Academy lectures on the website

**Owner:** "bring lectures in the website about academia entries."

**Built:** `site/academia.html`, a Spanish entry page in the `vp.css` family, linked from the home's entry list (`entryAcademia`, ES/EN) and from Empezar (readings section + end links). Fifteen lectures across the Academy's four levels, each an adaptation of one Academy concept for a 16-year-old reader, one step beyond the 12 lessons:
- 101: `risk-vs-return`, `margin-of-safety`, `survival-first`, `cycles-and-psychology`
- 201: `rebalancing`, `dca-vs-lumpsum`, `factors`, `currency-101`
- 301: `valuation-101` (incl. the 2026-11-15 P/E traps), `big-market-delusion`, `low-risk-vs-high-uncertainty`, `thesis-creep`, `familiarity-bias`
- 401: `reversibility`, `debiasing-by-structure`

Each lecture: level and sources, title, one-line idea, 2-4 paragraphs, a "Probalo" exercise, a "La base" link back to its lesson, and an "Actualizada" date. Drafted by four writer agents in parallel (one per level) to a shared spec, then edited.

**Left out on purpose:** `first-hike-is-not-a-sell-signal` (n=5, its averages unverified, the 100% claim already corrected) and `ai-and-incumbency` (too tied to live holdings debates). Both show in the sync check as "no lecture yet."

**Edits during assembly (accuracy):** Amazon's clean trailing P/E is labelled "una estimación aproximada" (it is our own estimate); Nike softened to "llegó a caer más de 70%" and the S&P +85% dropped; the 1990/2000 top-10 claim attributed to Bilello ("según sus datos"), since the Academy marks those as not re-checked; Haisley's title generalized to "investigadora de finanzas conductuales"; Bezos one-way/two-way doors dated to his 2015 shareholder letter.

**Facts checked:** S&P 500 2020 fall ~34% (Feb 19 to Mar 23) and new high Aug 18 2020; Nasdaq Composite 2000 high (~5,048) regained Apr 2015; Lehman 2008; Vanguard 2012 lump sum beat 12-month DCA about two thirds of the time (US/UK/Australia); Vanguard 2010 rebalancing study; Swedroe 5/25; Argentine convertibility 1991-2002, peso above 3 per dollar in 2002; Klein premortem (HBR 2007). Arithmetic recomputed: -50%/+100%, -20%/+25%, -90%/+900%, +50%/-50% = -25%, 30/70 ≈ 43%, margin 40% and upside 67%, 5/25 bands, the 75/25 → 70/30 new-money split, 2/2.2 ≈ -9%, 1.5/1.6 ≈ -6.25%, 1/17.8 ≈ 5.6%, 134.78/77.67 ≈ +74%.

**Keeping it in sync:** each article carries `data-slug` and `data-updated`. `check_lectures.py` (read-only) flags a lecture as STALE when its concept file's `last-verified` is newer, marks level-file concepts for a manual check, and lists concepts with no lecture. Exit code 1 if anything is stale.

**Verified:** 15 lectures, no duplicate ids, 14 lesson back-links all hit real lesson ids, in-page anchors resolve, HTML balanced (academia + empezar), zero em/en dashes, no internal names or client references. ~5,000 words. Visual rendering still unverified.

---

## 2026-11-15 — Empezar and the 12 lessons made complementary; calculator reworked

**Owner:** "arreglemos el empezar e invertir desde cero para que sean complementarios y coherentes" and "la calculadora de cuántos años tardás asusta un poco."

**Coherence fixes:**
- Cushion: lessons said 3-6 months, Empezar said "experts say at least 6, ideally 2 years." Both now say 3-6 is the common rule. Empezar keeps the Owner's view (start at 6, grow to 1-2 years over time, no need to wait before investing). Lesson 2's depth layer adds the same nuance in ES and EN.
- Saving: Empezar's 15-20% is now explicitly the "20" of lesson 3's 50/30/20.
- Portfolio: lesson 9 splits cash / bonds / stocks; Empezar's A/B were 100% stocks with no bridge. New paragraph: cash = the separate cushion, A and B = the stocks part for 10+ year money, C adds bonds, D is short-term money.
- Return assumption: lessons use ~7% real for stocks; the calculator defaults to 5% real and says why (prudence, some bonds).
- Wording: "cartera" → "portafolio" throughout Empezar (gender agreement fixed), anchor `#carteras` → `#portafolios`.

**Cross-links:** 9 lessons get a "→ Con tus números: la guía Empezar" line (`guide` field in `content.js`, `buildGuideRef` in `app.js`, ES/EN strings). 11 Empezar sections get a "La base: lección N" line (13 links). `app.js` now scrolls to `index.html#<lesson>` on load, since lessons are built by script.

**Calculator (the scary part):** the old version answered one number, "~36 years," which read like a sentence. Now it simulates month by month (cushion first, then investing) and shows progress: what you have invested at 5, 10 and 20 years in "years of expenses covered," the **age** you reach the goal, how much of it the market put in, and what +5 points of saving does. Defaults: age 25, salary 1,500, 20%, spend 1,000, 6-month cushion, 5% real → cushion in 20 months; $13,004 / $36,941 / $106,483 at 5/10/20 years; goal at 56; market puts in 56%; at 25%, 53. If the goal falls after 75, it shows what you would have at 65 (and that it adds to any pension) plus the savings rate that reaches the full goal by 65, instead of ages like 112. Copy in §1 adds that compounding ends up putting in about half.

**Verified:** `node --check` on all JS; zero em/en dashes; empezar.html tags balanced; every `guide` anchor exists in empezar.html, every back-link hits a real lesson id, every in-page anchor exists; DEEP es/en aligned; UI keys present in both languages. Plan math: hand recomputation of the 10-year balance matches (36,941); fuzz 480 combos, zero non-finite, market share always in [0,1]. Calculator rendered against a minimal fake DOM for 6 profiles (default, low income/5%, age 35, age 60, 0%, already past the goal), all texts sensible. Visual rendering still unverified.

---

## 2026-11-14 — Hosting decision: separate public repo

**Owner:** "repo público será." Greg's call on *which* repo: not axecap. Its tracked files hold personal financial context outside `clients/` (NU concentration and RSU rules, dollar figures in the Academy, `.claude/` memory files), so making it public would leak them. The site is published from its own public repo instead.

- Local repo created at `~/dev/ai-repos/invertir-desde-cero` (branch `main`, one commit), holding only the built site plus a README.
- `build_pages.py` now writes into that working tree: clears everything except `.git` and `README.md`, copies `site/`, injects the CSP meta, writes `.nojekyll`. Guards tested: refuses the axecap root (would contain `site/`) and any non-empty directory that is not a previous build.
- The axecap Actions workflow from the previous entry was removed. Pages is served from the public repo's `main` branch root, no Actions needed.
- **Publishing flow:** edit `site/` here, run `python3 -I office/projects/invertir-desde-cero/build_pages.py ~/dev/ai-repos/invertir-desde-cero`, commit and push there.
- **Not done yet:** creating the GitHub repo and pushing (`gh` is not authenticated on this machine), and enabling Pages.

---

## 2026-11-14 — "Empezar" entry page (the Owner's original memo) + GitHub Pages setup

**What happened:** The Owner shared the memo that started the whole project (savings goal = monthly spend x 12 x 20, pay yourself first 15-20%, emergency fund 6 months to 2 years split across banks and currencies, passive index investing via CEDEARs, 70/30 SPY/QQQ, rebalancing, other goals) and asked for a Spanish page that reads like it, then widened it to "several sections with lectures and proposals of how to accommodate a portfolio, how to start and save, differences between instruments," then asked to prepare it for GitHub Pages.

**Built:** `site/empezar.html`, a Spanish-only entry page in the `vp.css` family, linked first in the home's entry list (`entryEmpezar`). Twelve sections: la meta, pagate primero, calculator, fondo de emergencia, instruments table (11 rows, prestar vs ser dueño), índices/DCA, four sample portfolios (A 70/30 SPY/QQQ, B 40/30/30 with SCHD or VOOV, C 50/20/30 with short bonds, D 100% low risk for 1-3 year goals), rebalanceo, otros objetivos, flip-card mistakes, an 8-step checklist, six readings. New `memoCalc` in `vp.js` (pure math exported as `VP.memoPlan`). New styles appended to `vp.css`; a `.myth.pair` variant so the left box is not struck through (the Owner's 20-year rule is not a myth).

**Edits to the Owner's memo, deliberate:**
- Rebalancing example was internally inconsistent (QQQ "35% instead of 20%", back to "40, 20, 40" in a 70/30 portfolio). Rewritten on 70/30: $10,000 at 6,500/3,500, sell $500 of QQQ, or redirect new money.
- "Three funds = low, medium, high risk" corrected to the classic three-fund definition (home stocks, international stocks, bonds), and the page says plainly that A and B are 100% US stocks. Added portfolio C with bonds for readers who would sell in a 30% drop.
- "Recessions last no more than 2 years on average" replaced with the NBER fact (post-1945 US average ~10-11 months) and the real reason for a big cushion (job search outlasts recessions, LatAm crises come in clusters). The Owner's 2-year opinion is kept in first person.
- "Never lost in a 20-year window" kept for US stocks with dividends since 1926, with Japan 1989-2024 as the counterexample.
- "Cocos charges no commissions" dropped as an unverifiable, changing claim. Brokers are still named as examples with "compare commissions".
- The single-stock list is kept with Kodak (2012) and GE (out of the Dow 2018) as warnings and a 10-20% cap suggestion.
- Added the 25x / 4% rule beside the 20x goal (Bengen 1994).

**Scope change vs PROJECT.md:** this page names country-specific products (CEDEARs, cauciones, Balanz, Cocos, IB) because it is the Owner's own Argentine memo. The 12 lessons stay generic.

**Numbers recomputed:** 1,000 x 12 x 20 = 240,000; 25x = 300,000; 6 and 24 months = 6,000 / 24,000; calculator default (salary 1,500, 20%, spend 1,000, 6 months, 4% real) = 300/month, cushion in 20 months, goal 34 years after, ~36 total; at 30% = 28; 24-month cushion = 80 months to fill, ~41 total; 0% real = 69. 2% fee over 30 years at 7%: final 4.32x vs 7.61x, gain 3.32 vs 6.61, about half the gain. 2008 S&P 500 -37%, 2022 QQQ about -33%. Fuzz test over 1,152 input combinations: zero non-finite outputs.

**GitHub Pages:** `build_pages.py` copies only `site/` into an output dir, injects a CSP `<meta>` (Pages cannot set headers; the source files stay CSP-free so `file://` keeps working) plus `referrer: no-referrer`, and writes `.nojekyll`. Workflow `.github/workflows/pages-invertir-desde-cero.yml` runs it and deploys the artifact, so nothing else in the repo is published. Built locally: 6 pages, CSP present in all 6.

**Not verified:** visual rendering (same headless-Chrome limitation as before), and the workflow has not run on GitHub yet.

---

## 2026-11-11 (session 4) — Independent entries for sudden / high / volatile earners

**What happened:** Owner asked for another entry point to investing "from the point of view of: I'm earning a ton because my life is going great" (social media, football players, any profession with big jumps in income), then clarified mid-build: **"armá entradas independientes"**. Built three standalone pages, one per audience, each with its own hook, data, calculator, traps and 90-day plan, all linked from a new "otras puertas de entrada" row in the main hero (next to the 12-year-olds page).

| Page | Audience | Thesis | Hero (the thesis as a chart) | Calculator |
|---|---|---|---|---|
| `futbolistas.html` | football players | "Tu carrera dura diez años. Tu vida, sesenta." | income bars by age vs the level spend that income supports for life | lifetime spend: sustainable spend to age 90 + the age your current spend runs out |
| `creadores.html` | creators, streamers, influencers | "Este mes la rompiste. ¿Y el que viene?" | 24 jagged months vs a flat self-paid salary | pay-yourself-a-salary: 24-month simulation, tax set-aside, cushion |
| `de-golpe.html` | windfalls: company sale, big contract, hit song, bonus/stock, inheritance | "Te cayó una fortuna. Ahora viene lo difícil." | the same $1M lasting 16 vs 66 years depending on spend | freedom number (3.5% / 4%) + years to reach it |

**Shared engine:** `vp.css` + `vp.js` (the pages declare `data-hero`, `data-calc` with JSON defaults, `.flip` cards and a `.plan` checklist; the engine wires whatever is present; checklist progress persists per page in `localStorage`). Each page reads and works on its own; the shared files are a code dependency only. Look: a dark "highlight reel" hero selling the success (black + champagne), then the family's daylight paper/ink for the long game, mirroring the costume-then-truth structure of "La casa siempre gana".

**Facts, verified before writing:**
- The widely repeated "78% of NFL players are broke or in financial stress within 2 years of retiring" (Sports Illustrated, 2009) was never measured that way. The rigorous study (Carlson, Kim, Lusardi & Camerer, AER 2015, all 2,016 players drafted 1996-2003; median career ~6 years, median career earnings ~$3.2M in 2000 dollars): **1.9% filed for bankruptcy 2 years after retiring, 15.7% after 12**, and **bankruptcy rates were not affected by total earnings or career length**. The page presents the myth vs the data and leads with that last finding. Caveat stated on the page: American football, no equally rigorous football (soccer) study.
- Florida lottery winners of $50K-150K (Hankins, Hoekstra & Skiba, REStat 2011): the big prize **postponed bankruptcy rather than preventing it** (fewer filings in years 1-2, the gap gone by years 3-5).
- Football careers: a systematic review puts retirement around **34 (±4) years** after careers of **~11.6 (±5) years** at the top level; far shorter when lower leagues are included. Not used: a "FIFPro says 8 years" figure that only appears second-hand on a blog.
- Enron (2001) employees losing jobs and retirement savings together because much of their plan was in company stock: stated as "gran parte", not a precise percentage.
- 4% rule (Bengen 1994 and follow-ups, US data, ~30-year horizons); the page recommends 3-3.5% for horizons of 50+ years and says the past does not guarantee the future.

**Numbers in the copy, computed and asserted by tests:**
- Footballer defaults (age 22, 8 years at $300k net, then $30k/yr to 65, 3% real, plan to 90): **sustainable spend $90,580/yr** (copy: "unos $90.000"); **spending $180k/yr runs out at 39**; $100k/yr runs out at 74.
- Creator pattern: 24 months, mean exactly 1, starts with an 8-month bad streak. The first pattern was too forgiving (paying 100% never broke the cushion, so the lesson never appeared); redesigned so **paying 100% of the average breaks a 3-salary cushion in month 7, 90% touches zero, 80% never breaks** and ends with ~7 months of surplus. Caption months **$900 / $7,800** on a $3,000 average (first draft said $1,200: wrong, fixed).
- Windfall $1M at 3% real: **spending 8% ($80k) lasts 16 years, 3.5% ($35k) lasts 66**, 3% lasts forever.
- Freedom number: $60k/yr → $1,714,286 at 3.5%, $1,500,000 at 4%.

**Verified:** syntax; no em dashes in any new or touched file; `vp.js` smoke test driven by each real HTML page's declarations (18-20 checks per page): hero renders with no NaN labels, every calculator populates and stays NaN-free under garbage / zero / negative / huge inputs, all six cards flip, the 8-step plan updates progress and persists, and every number quoted in the copy matches the engine. The test caught a real fragility: legends were built by chaining `appendChild(...)` with `lastChild`; replaced with a small `legend()` helper. Main-site smoke tests re-run after adding the entries row: 112 + 116 passing; UI keys identical in ES/EN.

**Language:** Spanish-only, same as "La casa siempre gana" (Owner's examples and audience are Argentine/Spanish-speaking). The main hero labels them "(in Spanish)" in English mode.

**Not verified:** visual rendering (opened in the Owner's browser, not seen by me) and whether the copy lands with actual footballers / creators.

---

## 2026-11-11 (session 3) — "La casa siempre gana": anti-gambling page for 12-year-olds

**What happened:** Owner asked for a modern page that hooks 12-year-olds ("los pibes") so they do not gamble or waste their future, and explicitly asked to "wake up a designer." Spawned the team's **Designer** (`team/roles/designer.md`) and **UX Researcher** (`team/roles/ux-researcher.md`) in parallel; verified Argentine facts and help lines myself against official `.gob.ar` sources.

**Designer's concept (adopted):** the casino is a costume the page takes off in front of the kid. Neon night casino in the hero only; when the session ends the lights go off (one-way switch, the neon never returns) and the rest of the page is the family's paper/ink daylight, reading as "the truth." No mascot, no sad teens or chains, no stats wall before they play, no gradient-blob hero.

**⚔️ Conflict, resolved by Greg:** the Designer wanted the slot to deliberately stage near-misses and then reveal "it was programmed." The UX Researcher's evidence: free-play gambling designed to feel rewarding is associated with risk markers in 12-17-year-olds (King, Delfabbro et al. 2014, n=1,287; Frahn, Delfabbro & King 2015; mostly cross-sectional), and safe simulations are boring on purpose. **Decision: safety wins.** The slot is honest and flat: no staged near-misses (losing reels are uniform random), no celebration on wins (plain copy, no lights, no sound, no "!"), the net result is always on screen, a "spin 10,000 times" button is available from the start, and the session ends with a reflection prompt. The near-miss trick is *explained* on a hook card instead of being used on the kid.

**Also adopted from research:** a **predict-then-reveal football section** targeting the illusion of control through knowledge (Cantinotti, Ladouceur & Jacques 2004: expert bettors beat chance at picking winners but did not make more money); **every risk message paired with a concrete action** (Peters, Ruiter & Kok 2013: fear without efficacy backfires); peer, curious tone ("how they design it to hook you"), not moralizing; **help section built friend-first** (adolescents disclose to peers) and led by the national line. The researcher's main caveat stands: no study shows web content like this changes gambling *behavior* in 12-year-olds, only misconceptions. Recommended: a small think-aloud test with real kids before launch, checking that the slot is *not* fun.

**Sections:** (1) honest slot (100 fake chips, 20 spins, 5/spin) → lights off → (2) reveal comparing their session with a 10,000-spin run → (3) roulette strip, 37 cells in European wheel order, green 0 pulses → (4) 100-kid simulator at 10 / 100 / 1,000 / 10,000 bets → (5) football odds predict-then-reveal → (6) six flip cards: welcome bonus, near-miss, influencers, chasing losses, loot boxes, adult accounts/"cajeros" → (7) "¿tiene mecánica de apuesta?" 10-card game with the three-ingredient rule (stake + chance + prize), buttons + swipe + arrow keys → (8) "your other future" in real terms → (9) help → (10) close.

**Numbers, all recomputed:**
- Slot paytable on a 5-chip spin: 7×3 25× @0.4%, ★×3 10× @1.2%, BAR×3 5× @3%, ♥×3 3× @5%, ◆×3 2× @20% → **RTP 92.0%**, some win on 29.6% of spins. The first draft had a 50× jackpot, which would have let ~22% of kids finish 1,000 spins *ahead* and undermined the lesson; flattened the table and moved the big run to 10,000 spins: P(player ahead) ≈ 43.6% after 20 spins (intentional: the reveal shows the long run next to it), 12.6% after 1,000, **0.01% after 10,000**. Empirical check with the shipped code: 400 runs × 10,000 spins → mean house take 3,948 (expected 4,000), sd 1,077 (expected ~1,100), **house ahead in 400/400**.
- Roulette: 18 red / 18 black / 1 green, edge on red = 1 - 2×18/37 = **2.70%**.
- Simulator, exact binomial (p = 18/37, no bankroll limit), share of 100 kids ahead: **34.4 after 10 bets, 35.5 after 100, 18.8 after 1,000, 0.3 after 10,000.** (Designer's brief said ~40 at 10; corrected to the exact figure.)
- Football: first-draft odds 1.50/4.00/6.00 rounded to 67+25+17 = 109%, an error a kid adding the numbers would catch. Changed to **2.00/4.00/3.00 → 50% + 25% + 33% = 108%** (exact 108.33%); bar segments 46.1/23.1/30.8 with the 100% marker at 92.3%.
- Future: $2,000/week from age 12 at 4% real → $703,271 at 18, $1,762,884 at 25, $5,297,883 at 40 (on $2,912,000 put in), in today's money.

**Help lines published (each verified on an official source, Nov 2026):**
- National: **141 (Sedronar)**, free, confidential, 24 h; **Línea 102**; **chatbot TINA, WhatsApp 11 3910-1010**. Source: argentina.gob.ar, Capital Humano campaign to prevent betting by children and adolescents (published 2026-06-26).
- CABA: **0800-666-6006**, Mon-Fri 9-17; **Boti WhatsApp 11 5050-0147** writing "ludopatía"; 108 option 3. Source: buenosaires.gob.ar.
- PBA: **0800-444-4000**, Programa de Prevención y Asistencia al Juego Compulsivo. Source: loteria.gba.gob.ar/juego-compulsivo.
- Not published (could not verify): other provinces' lines, Jugadores Anónimos.
- Legal age: betting is prohibited under 18 (buenosaires.gob.ar; UNICEF Argentina guide).

**Language:** this page is Spanish-only on purpose: the audience is Argentine kids and the help resources are Argentine. The main site links to it from the hero in both languages (the English label says it is in Spanish).

**Verified:** syntax; no em dashes in any site file (the "—" empty-value placeholders were replaced too); smoke test for `la-casa.js` (53 checks, run 8 times in a row, all passing): exactly 20 spins then the session locks, lights-off + reveal, 10,000-spin numbers consistent (kept + returned = put in, house ahead), no exclamation in slot copy, roulette strip composition and single highlight, simulator ordering and reset, odds lock + reveal, card flip and flip back, all 10 quiz answers via button / arrow key / swipe, arrow keys ignored on form controls, play again, future formula and zero/garbage handling, copy-to-clipboard. One test was initially too tight (it failed on a legitimate ~2 sd outcome); diagnosed with a 400-run sample of the real code before loosening it. Main-site smoke tests re-run after adding the link: 112 + 116 checks passing.

**Still not verified:** visual rendering (headless Chrome still hangs here) and, more importantly, **whether real 12-year-olds find it engaging and not "fun to gamble."** That needs kids, not code.

---

## 2026-11-11 (session 2) — Redesign as one editorial scroll + depth layer to ~20 minutes

**What happened:** Owner asked for "a simple scrolling site with modern UI, not just bullshit boilerplate" (an earlier draft of the message also said "neogothic"; the final message dropped it, so it was treated as not requested and offered back as an option). Mid-build, the Owner added: "a 20 min reading prepared with deep understanding of each of the areas."

**Redesign (v2):**
- **One scroll, no router.** Hero → Part I → lessons → Part II → … → summary. Lessons are anchors (`#inflacion`), so deep links still work.
- **The hero is the thesis, not decoration:** an SVG curve of $100/month for 30 years at 7% draws itself, with the dashed "what you put in" line underneath and both end values labeled. It is computed from the same `compoundSeries` the calculator uses.
- **Editorial type system on system fonts only** (Iowan Old Style / Charter / Georgia for display, system sans for body, system mono for labels). Oversized outlined lesson numerals, full-bleed ink part dividers with outlined roman numerals, a vermilion signal color used only for emphasis and interaction.
- **Calculators as dark "instruments":** slider for quick play plus an editable number for exact or larger values (the slider pins at its max, the number accepts up to a hard max). Big tabular-figure readouts. The emergency-fund instrument gained a fill meter.
- **One calculator per scroll,** each at its most relevant lesson (inflation L1, emergency L2, compound L4, portfolio L9). The four repeats from v1 (L3, L7, L8, L11) were removed: in a single scroll they would show the same widget four times.
- **Reading aids:** fixed 3px progress bar; desktop index rail (≥1200px) highlighting the lesson in view and showing completion dots; on mobile, the top bar shows "06 / 12 · title". The top bar uses `mix-blend-mode: difference` so it stays legible over both paper and ink sections.
- **Motion with restraint:** fade-up reveals via IntersectionObserver; everything shown immediately if IO is missing or the reader prefers reduced motion. Switching language re-renders and keeps you on the lesson you were reading.

**Depth layer (`site/deep.js`):** 3 paragraphs per lesson per language, each one of: the mechanism (why prices rise, why bond prices fall when rates rise, why indexing wins arithmetically), a worked example with real numbers, or the limit / common mistake. Kept in a separate file so `content.js` stays the "core lesson" and the depth can be edited or extended on its own; `app.js` reads them as one continuous body.

**Reading time:** lesson prose is now **4,361 words (ES) / 4,302 (EN) = ~20 minutes at 220 wpm**, ~2 minutes per lesson, plus ~900 words of quizzes. The hero shows the total and each lesson shows its own minutes, computed live from the text (so it stays honest if content changes).

**New numbers, all recomputed before shipping:**
- Ana vs Bruno: $100/month age 20-30 then stop ($12,000 in) → $182,625 at 65; $100/month age 30-65 ($42,000 in) → $171,141. Ana wins with under a third of the contributions.
- Fees: 0.2% vs 2.0% yearly on $100/month for 30 years at 7% gross → $112,722 vs $81,538, a 27.7% loss. Copy says "more than a quarter" (a lump sum would lose 39.9%; the lesson uses the monthly case).
- Nominal vs real: +8% with 10% inflation → -1.82% real ("about 2%").
- Debt: $100.000 at effective 80% → $180.000; $5,000 at 25% → $6,250.
- Rebalance: $7,000/$3,000, stocks +30% → $9,100/$3,000 (75.2/24.8), sell ~$630 to return to 70/30.
- P/E 100/5 = 20; time cost 150,000/5,000 = 30 h and 150/20 = 7.5 h.
- External facts stated conservatively: Argentina 2023 inflation over 200%; Zimbabwe 2008 prices doubling roughly daily; 2022 long US Treasuries down over 30%; SPIVA ~9 in 10 US large-cap active funds lag over 15 years; Bessembinder (2018) ~4% of US stocks account for all net wealth creation since 1926; Madrian & Shea auto-enrollment ~4 in 10 to ~9 in 10; Morningstar investor-return gap ~1 point/year or more; US stocks down in ~1 of 4 years, no losing 20-year period with dividends.

**Verified:** syntax on all JS; em-dash scan clean across all five site files; integrity (12 lessons, 4 calculators each embedded once, DEEP present and es/en aligned for every lesson, no orphan keys, UI keys identical). Smoke test rewritten for the scroll build and run in two modes: **112 checks with no IntersectionObserver** (fallback reveals everything, all 12 sections render body + depth, calculators only where assigned, readouts never NaN, quiz completion, rail dots, progress text, reset, progress-bar math, portfolio cap, garbage/negative/huge inputs) and **116 checks with a fake IntersectionObserver** (adds: active-lesson tracking, mobile "now" label, reveal on intersect, language switch keeps scroll position). The IO run caught a real inconsistency: `app.js` feature-detected `window.IntersectionObserver` but constructed the bare global; now constructs `window.IntersectionObserver` consistently.

**Still not verified: how it looks.** Headless Chrome hangs on this machine (see session 1). No one has seen the layout, type, curve animation or mobile view yet.

---

## 2026-11-11 — Charter and v1 build

**What happened:** Owner asked for a new project: a website to help people start investing, from basic concepts to savings to capital allocation, "in simple terms like we are in high school."

**Before building:** checked the existing book project (`office/projects/todo-el-tiempo-del-mundo/`), which already covers nearly the same ground in long-form literary Spanish. Rather than guess how the two relate, asked the Owner three questions. Answers: **bilingual** (ES + EN), the site is the **front door to the book** (lesson N points to chapter N), and **include simple calculators**.

**Built (`site/`):**
- `content.js`: all copy. 12 lessons in 3 parts, both languages (~2,100 words of lesson body each), 24 quiz questions per language with explanations, UI strings, part descriptions, book chapter map.
- `app.js`: hash router (`#/`, `#/lesson/<id>`, `#/tools`), language toggle persisted in `localStorage`, quiz logic with retry, completion tracking, and four calculators (compound interest with an SVG year-by-year chart, inflation, emergency fund, portfolio builder with a donut and a 2008 stress case).
- `index.html`, `styles.css`: light, friendly theme on purpose (high-school audience), distinct from the dark office artifacts. Mobile breakpoint at 640px.

**Decisions:**
- **Lesson 3 (saving habits) has no matching book chapter,** so it points to the epilogue ("ahorrá"). Added because the Owner named "savings" as a stage explicitly, and the book folds it into chapter 2 rather than teaching the habit itself.
- **Examples are localized per language, concepts are not.** Spanish: alfajor, 80% card rate, $50.000 savings. English: pizza, 25% card rate, $5,000. Same lesson, numbers that feel real in each place.
- **Portfolio stress case is calendar 2008** (stocks -37%, high-quality bonds +5%) rather than "everything falls at once," because it is historically accurate and it demonstrates the cushioning claim lesson 6 makes.
- **No CSP `<meta>` in v1.** Some browsers block a page's own scripts under `script-src 'self'` when opened from `file://`. Since all content is static and ours, a broken site was the bigger risk. The header to set at hosting time is written in `METHOD.md` §6.
- **No hosting, analytics or accounts.** Nothing collects reader data; progress stays in the reader's browser.

**Verified:**
- `node --check` passes on `app.js` and `content.js`.
- Em-dash scan across all four site files: none.
- Content integrity (vm-loaded `content.js`): 12 lessons, unique ids, UI keys identical in ES/EN, every lesson has both languages with the same paragraph count, quiz count and correct-answer index, all chapter refs exist, all tools valid.
- Every number in the lesson copy recomputed: 100,000 / 1.1 = 90,909 (copy says "~91,000"); 100,000 / 1.1^5 = 62,092 ("~62,000"); 1.1^7 = 1.949 ("doubles roughly every 7 years"); 1.1^21 = 7.40 ("more than 7 times"); 72 / 6 = 12 and 72 / 8 = 9; $100 at 10% for 2 years = $121.
- Calculator math sanity: $100/month for 30 years at 7% gives $116,945 on $36,000 contributed; 0% rate returns the principal unchanged; a 60/30/10 portfolio shows 4.8% average and -20.7% in the 2008 case.
- **Runtime smoke test (56 checks, both languages):** `app.js` executed against a minimal fake DOM in Node (scratch harness, not shipped; no npm packages installed). Covers: home renders all 12 cards; every lesson renders its title; answering each quiz correctly marks all 12 lessons complete; a wrong answer offers retry and retry resets the question; every calculator's outputs populate after input changes; the tools page shows 4 calculators; an unknown lesson id shows the not-found message; the portfolio sliders never let stocks + bonds exceed 100%; garbage and negative inputs never render NaN or Infinity.
- **Not verified: visual rendering in a real browser.** Headless Chrome hangs on this machine (killed by a 25s timeout twice, no screenshot produced; likely a managed/restricted Chrome install). Layout, the chart, the donut and the mobile breakpoint have not been seen by anyone yet. First Owner open of `site/index.html` is the first visual check.

**Next:** Owner read-through for voice and examples; hosting decision; wire `BOOK_URL` once the book is published.
