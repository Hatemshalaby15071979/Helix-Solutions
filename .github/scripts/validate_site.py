#!/usr/bin/env python3
"""Fail-closed validation of the Helix Solutions static site.

Checks, for every published HTML page:
  1. the canonical Helix Solutions brand is present;
  2. <div> tags are balanced;
  3. every local `assets/...` reference resolves on disk.

No third-party dependencies. Used by .github/workflows/ci.yml and runnable
locally with `python3 .github/scripts/validate_site.py`.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Presentation sources and brand sheets are not published pages.
SKIP_NAMES = {
    "brand-sheet.html",
    "assay-logo.html",
}

# Deck slide sources live under helix-codex-deck/ and are not published pages.
SKIP_PATH_PARTS = {"helix-codex-deck"}


def html_files() -> list[Path]:
    return sorted(
        p
        for p in ROOT.rglob("*.html")
        if "node_modules" not in p.parts
        and ".git" not in p.parts
        and not (SKIP_PATH_PARTS & set(p.parts))
        and p.name not in SKIP_NAMES
    )


def main() -> int:
    errors: list[str] = []
    pages = html_files()
    branded = 0

    for page in pages:
        text = page.read_text(encoding="utf-8", errors="replace")
        rel = page.relative_to(ROOT)

        # 1. canonical brand marker (inline SVG label or the .hs-brand class)
        if "Helix Solutions" in text or "hs-brand" in text:
            branded += 1
        else:
            errors.append(f"{rel}: missing canonical Helix Solutions brand")

        # 2. balanced <div> tags
        opens = len(re.findall(r"<div\b", text, re.I))
        closes = len(re.findall(r"</div\s*>", text, re.I))
        if opens != closes:
            errors.append(f"{rel}: unbalanced <div> ({opens} open, {closes} close)")

        # 3. local asset references resolve relative to the page
        for ref in re.findall(r'(?:src|href)="([^"#?][^"]*)"', text):
            if ref.startswith(("http://", "https://", "mailto:", "data:", "/", "//")):
                continue
            target = (page.parent / ref.split("#", 1)[0]).resolve()
            if not target.exists():
                # Only flag references that clearly point into the tree's assets.
                if "asset" in ref.lower() or ref.lower().endswith(
                    (".css", ".js", ".svg", ".png", ".woff2", ".ico", ".vtt", ".mp4")
                ):
                    errors.append(f"{rel}: missing asset reference -> {ref}")

    print(f"pages checked: {len(pages)}")
    print(f"pages branded: {branded}")

    if errors:
        print(f"FAIL: {len(errors)} issue(s):", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("OK: all checks passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
