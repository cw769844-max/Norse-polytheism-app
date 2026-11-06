#!/usr/bin/env python3
"""Build src/content/runes/poems.json from the transcribed rune poems.

Source: Bruce Dickins, Runic and Heroic Poems of the Old Teutonic Peoples (1915),
transcribed in content-sources/dickins-1915/ (see the README there).

Usage (from the repository root):  python3 -I scripts/import_rune_poems.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SOURCE_DIR = Path("content-sources/dickins-1915")
OUT = Path("src/content/runes/poems.json")

EDITION = {
    "editor": "Bruce Dickins",
    "title": "Runic and Heroic Poems of the Old Teutonic Peoples",
    "publisher": "Cambridge University Press",
    "year": 1915,
    "license": "Public domain",
    "source": "https://en.wikisource.org/wiki/Index:Runic_and_heroic_poems_of_the_old_Teutonic_peoples.djvu",
}

POEMS = {
    "norwegian": "The Norwegian Rune Poem",
    "icelandic": "The Icelandic Rune Poem",
}

STANZAS = 16


def parse(path: Path) -> dict[int, dict]:
    stanzas: dict[int, dict] = {}
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8").strip()):
        rows = block.strip().split("\n")
        if not rows[0].strip().isdigit():
            raise ValueError(f"{path}: block without a stanza number: {rows[0]!r}")
        number = int(rows[0])
        lines, gloss = [], None
        for row in rows[1:]:
            if row.startswith("~"):
                latin, king = row[1:].split("|")
                gloss = {"latin": latin.strip(), "king": king.strip().rstrip(".")}
                continue
            indent = row.startswith(">")
            lines.append({"text": (row[1:] if indent else row).strip(), "indent": indent})
        if number in stanzas or not lines:
            raise ValueError(f"{path}: duplicate or empty stanza {number}")
        stanzas[number] = {"lines": lines, "gloss": gloss}
    if sorted(stanzas) != list(range(1, STANZAS + 1)):
        raise ValueError(f"{path}: expected stanzas 1..{STANZAS}")
    return stanzas


def main() -> int:
    poems = {}
    for poem_id, title in POEMS.items():
        original = parse(SOURCE_DIR / f"{poem_id}.txt")
        english = parse(SOURCE_DIR / f"{poem_id}_en.txt")
        stanzas = []
        for n in range(1, STANZAS + 1):
            stanza = {"n": n, "original": original[n]["lines"], "english": english[n]["lines"]}
            if original[n]["gloss"]:
                stanza["gloss"] = original[n]["gloss"]
            stanzas.append(stanza)
        poems[poem_id] = {"id": poem_id, "title": title, "stanzas": stanzas}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"edition": EDITION, "poems": poems}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{OUT}: {len(poems)} poems, {STANZAS} stanzas each")
    return 0


if __name__ == "__main__":
    sys.exit(main())
