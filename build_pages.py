"""Build the GitHub Pages copy of Invertir desde cero.

The site is published from a separate public repo (axecap itself holds
personal financial context and must stay private). This script copies only
site/ into that repo's working tree, so nothing else is published, and injects a Content-Security-Policy <meta> into every page.
GitHub Pages cannot set response headers, and the CSP is left out of the
source files because a script-src 'self' policy breaks pages opened from
file:// (see METHOD.md section 6). frame-ancestors is header-only, so it is
omitted here.

Usage: python3 -I build_pages.py ~/dev/ai-repos/invertir-desde-cero
"""
import shutil
import sys
from pathlib import Path

CSP = (
    "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data:; base-uri 'none'; form-action 'none'"
)
META = (
    f'<meta http-equiv="Content-Security-Policy" content="{CSP}">\n'
    '<meta name="referrer" content="no-referrer">\n'
)
ANCHOR = '<meta charset="UTF-8">\n'


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: build_pages.py <output_dir>", file=sys.stderr)
        return 2
    src = Path(__file__).resolve().parent / "site"
    out = Path(sys.argv[1]).resolve()
    if out == src or src in out.parents or out in src.parents:
        print("output dir must not contain or be inside site/", file=sys.stderr)
        return 2
    # Only clear a directory that is empty, holds just .git/README.md, or is a
    # previous build (has index.html). Anything else is probably a wrong path.
    if out.exists():
        names = {p.name for p in out.iterdir()}
        if names - {".git", "README.md"} and "index.html" not in names:
            print(f"{out} does not look like a previous build; refusing to clear it", file=sys.stderr)
            return 2
    # The output may be the public repo's working tree: replace its contents
    # but keep its .git and README.md.
    keep = {".git", "README.md"}
    out.mkdir(parents=True, exist_ok=True)
    for child in out.iterdir():
        if child.name in keep:
            continue
        if child.is_dir() and not child.is_symlink():
            shutil.rmtree(child)
        else:
            child.unlink()
    shutil.copytree(src, out, dirs_exist_ok=True)
    pages = sorted(out.glob("*.html"))
    for page in pages:
        html = page.read_text(encoding="utf-8")
        if ANCHOR not in html:
            print(f"{page.name}: missing {ANCHOR.strip()}", file=sys.stderr)
            return 1
        page.write_text(html.replace(ANCHOR, ANCHOR + META, 1), encoding="utf-8")
    # Serve files as-is; no Jekyll processing.
    (out / ".nojekyll").write_text("", encoding="utf-8")
    print(f"built {len(pages)} pages into {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
