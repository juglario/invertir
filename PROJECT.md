# Project: "Invertir desde cero / Investing from Zero"

**Status:** 🟢 Active · **Sponsor:** Owner · **Lead:** Greg · **Chartered:** 2026-11-11
**Artifact location:** `office/projects/invertir-desde-cero/site/` (static website) · **Doing documented in:** `METHOD.md` + `BUILDLOG.md`

---

## Why this exists

The Owner wants a website that teaches someone to start investing from absolute zero, from basic money concepts to saving to capital allocation, written at a high-school reading level. Same audience instinct as the book *Todo el tiempo del mundo* (friends, family, anyone starting out), but a different job: the book is long-form literary nonfiction, the site is short, plain-spoken and interactive.

**Relationship to the book (Owner decision, 2026-11-11):** the site is the **front door to the book**. It follows the book's 12-chapter arc as 12 short lessons, and every lesson closes with "want the full story? read chapter X." The site gives the concept in five minutes; the book gives the story behind it. They reinforce each other instead of competing.

Like the book, this is a standalone, shareable, generic product: no family-office references, no ties to any client portfolio, nothing that assumes the reader is this Owner's client.

## Owner decisions (2026-11-11)

| Question | Decision |
|---|---|
| Language | **Bilingual (Spanish + English)**, with a toggle. Spanish uses rioplatense voseo, matching the book. |
| Relation to the book | **Front door to the book** (lesson N maps to chapter N, with a closing reference). |
| Interactivity | **Simple calculators included**: compound interest, inflation, emergency fund, portfolio builder. All client-side. |

## Scope

**In scope:**
- 12 lessons in 3 parts, matching the Owner's framing: Part 1 "the basics" (inflation, emergency cushion, saving habits), Part 2 "growing your money" (compound interest, stocks, bonds, index funds), Part 3 "splitting your money" / capital allocation (diversification, portfolio building, behavior, time horizon, first step).
- Each lesson: one-sentence summary, 3-5 short paragraphs, an everyday analogy, an embedded calculator where relevant, a 2-question quick check with explanations, and the book reference.
- Four calculators, also collected on a standalone Calculators page.
- Local progress tracking (a lesson counts as complete when its quick check is all correct), stored only in the reader's browser.
- Works opened straight from disk: no build step, no server, no external dependencies, no network calls.

**Out of scope (for now):**
- Hosting/publishing (the site is ready to drop onto any static host; choosing one is a later Owner call).
- Country-specific broker, tax or product detail (kept generic, same rule as the book's chapters).
- Accounts, analytics, comments, or anything that collects reader data.
- Linking to the book: `SITE.BOOK_URL` in `site/content.js` is `null` until the book is published; until then, chapter references render as plain text.

## Deliverables

| Deliverable | Location | Status |
|---|---|---|
| Site shell, routing, language toggle, progress | `site/index.html`, `site/app.js`, `site/styles.css` | ✅ v1 |
| 12 lessons, ES + EN | `site/content.js` | ✅ v1 |
| 4 calculators (compound, inflation, emergency fund, portfolio) | `site/app.js` | ✅ v1 |
| Quick checks (24 questions per language) | `site/content.js` | ✅ v1 |
| Owner read-through and voice pass | n/a | ⏳ Pending |
| Hosting: GitHub Pages from a separate public repo, CSP via build-time meta | `build_pages.py` → `~/dev/ai-repos/invertir-desde-cero` | 🟡 Built locally, push + Pages pending (2026-11-14) |
| Book link wiring (`BOOK_URL`) | `site/content.js` | ⏳ Blocked on the book being published |

## Success

- A 15-year-old can go from "what is inflation" to "I know what percentage of stocks and bonds I could live with" in about an hour, without a single term left unexplained.
- Every number quoted in a lesson is arithmetically correct (verified in `BUILDLOG.md`), and every calculator assumption is stated on screen.
- A reader who finishes a lesson knows exactly which book chapter to read for the full story.

## v2 (2026-11-11, same day): one editorial scroll, ~20-minute read

Owner direction: "a simple scrolling site with modern UI, not boilerplate" and "a 20 min reading prepared with deep understanding of each of the areas." The site is now a single long scroll (hero, three part dividers, twelve lessons, summary) with a distinct editorial look, one calculator per scroll at its most relevant lesson, and a depth layer (`site/deep.js`) that brings lesson prose to ~20 minutes in each language. Details in `BUILDLOG.md` (session 2) and `METHOD.md`.

## "La casa siempre gana" (2026-11-11): anti-gambling page for 12-year-olds

`site/la-casa.html` (+ `la-casa.css`, `la-casa.js`), linked from the main hero. Spanish-only by design (Argentine kids, Argentine help lines). Built from a Designer brief and a UX Researcher evidence review; where they conflicted (staged near-misses), safety won. Interactive: an honest slot that switches the lights off, a roulette strip, a 100-kid simulator, a football-odds predict-then-reveal, flip cards on the hooks, a "does it have betting mechanics?" swipe game, a real-terms savings projection, and a friend-first help section with help lines verified on official sources. **Before any public launch:** (1) re-verify every phone number, (2) run a short think-aloud test with a few 12-year-olds, specifically checking the slot does not read as fun. Details in `BUILDLOG.md` session 3.

## Independent entry points (2026-11-11)

Owner direction: separate, standalone "entradas" for specific audiences rather than one page for everyone. Each is its own page with its own hook, verified data, calculator, traps and 90-day plan, linked from the main hero's "otras puertas de entrada" row:

| Entry | File | Audience |
|---|---|---|
| La casa siempre gana | `site/la-casa.html` | 12-year-olds (gambling, loot boxes) |
| Tu carrera dura diez años | `site/futbolistas.html` | football players |
| Este mes la rompiste | `site/creadores.html` | creators, streamers, influencers |
| Te cayó una fortuna | `site/de-golpe.html` | windfalls: company sale, contract, hit, bonus/stock, inheritance |

The three "viento en popa" pages share `site/vp.css` + `site/vp.js`. Adding another audience (e.g. musicians, tech workers with stock) = one new HTML page declaring its hero, calculator defaults, cards and plan; see `METHOD.md` §1e.

## Status

v2 built 2026-11-11; "La casa siempre gana" and the three "viento en popa" entries added the same day. Next: Owner read-through (voice, examples, anything that does not land for a teenager) and first visual check, then a hosting decision.
