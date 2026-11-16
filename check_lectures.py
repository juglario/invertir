"""Check that site/academia.html keeps up with the Academy.

Each lecture is an <article class="lec" data-slug="..." data-updated="YYYY-MM-DD">.
For every lecture this reports:
  STALE    the concept file's last-verified date is newer than the lecture
  ok       the lecture was written on or after the concept's last-verified date
  level    the concept is not broken out (lives in a level file), check by hand
It also lists broken-out Academy concepts that have no lecture yet.
Read-only. Exit code 1 if anything is STALE.

Usage: python3 -I check_lectures.py
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
PAGE = HERE / "site" / "academia.html"
CONCEPTS = REPO / "office" / "academy" / "concepts"

ARTICLE = re.compile(r'<article class="lec"[^>]*data-slug="([a-z0-9-]+)"[^>]*data-updated="(\d{4}-\d{2}-\d{2})"')
VERIFIED = re.compile(r"^last-verified:\s*(\d{4}-\d{2}-\d{2})", re.M)


def main() -> int:
    lectures = ARTICLE.findall(PAGE.read_text(encoding="utf-8"))
    if not lectures:
        print("no lectures found (expected data-slug and data-updated on each article)")
        return 1
    stale = 0
    for slug, updated in lectures:
        concept = CONCEPTS / f"{slug}.md"
        if not concept.exists():
            print(f"level  {slug} (no concept file, check the level file by hand)")
            continue
        m = VERIFIED.search(concept.read_text(encoding="utf-8"))
        if not m:
            print(f"level  {slug} (concept has no dated last-verified)")
        elif m.group(1) > updated:
            print(f"STALE  {slug}: concept verified {m.group(1)}, lecture written {updated}")
            stale += 1
        else:
            print(f"ok     {slug}")
    covered = {s for s, _ in lectures}
    missing = sorted(p.stem for p in CONCEPTS.glob("*.md") if p.stem not in covered)
    if missing:
        print("no lecture yet: " + ", ".join(missing))
    return 1 if stale else 0


if __name__ == "__main__":
    sys.exit(main())
