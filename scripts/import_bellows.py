#!/usr/bin/env python3
"""Import poems from Henry Adams Bellows' translation of the Poetic Edda (1923),
paired with the Old Norse text he translated from.

Bellows' translation was published in 1923 and is in the public domain. The
English is taken from the proofread transcription on English Wikisource:
https://en.wikisource.org/wiki/The_Poetic_Edda_(tr._Bellows)

The Old Norse comes from our transcription of Hildebrand and Gering's 1904
edition in content-sources/hildebrand-gering-1904/ (see the README there).

Usage (run from the repository root):

    python3 -I scripts/import_bellows.py --cache /path/to/cache-dir

Pages are downloaded into the cache directory (or read from it when already
present) and written as JSON to src/content/poems/<id>.json.

Requires: beautifulsoup4
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup, Tag

BASE_URL = "https://en.wikisource.org/wiki/The_Poetic_Edda_(tr._Bellows)/"
USER_AGENT = "HearthAndWell/0.1 (content import; https://github.com/cw769844-max/Norse-polytheism-app)"

OLD_NORSE_DIR = Path("content-sources/hildebrand-gering-1904")
OLD_NORSE_EDITION = {
    "editors": "Karl Hildebrand and Hugo Gering",
    "title": "Die Lieder der älteren Edda (Sæmundar Edda)",
    "year": 1904,
    "license": "Public domain",
    "source": "https://archive.org/details/dieliederderlte00hild",
}
# Bellows' stanza number -> the 1904 edition's, where they differ.
OLD_NORSE_ORDER = {"havamal": {88: 89, 89: 88}}

# id -> (Wikisource page, normalized Old Norse title, Bellows' English title)
POEMS = {
    "havamal": ("Hovamol", "Hávamál", "The Ballad of the High One"),
    "voluspa": ("Voluspo", "Vǫluspá", "The Wise-Woman's Prophecy"),
}

CESURA = "\u2003"  # em space between half-lines
GAP = "* * *"  # Bellows' marker for lost or omitted lines


def fetch(page: str, cache: Path) -> str:
    path = cache / f"{page}.html"
    if path.exists():
        return path.read_text(encoding="utf-8")
    request = urllib.request.Request(BASE_URL + page, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        html = response.read().decode("utf-8")
    path.write_text(html, encoding="utf-8")
    time.sleep(2)  # be polite to Wikimedia
    return html


def clean(text: str) -> str:
    text = text.replace("​", "").replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text).strip()
    # get_text() can leave spaces before punctuation where markup was removed
    return re.sub(r" ([,.;:!?)\]])", r"\1", text)


def line_text(line: Tag) -> str:
    for sup in line.select("sup.reference"):
        sup.decompose()
    for cesura in line.select(".wst-cesura"):
        cesura.replace_with(CESURA)
    text = line.get_text().replace("​", "").replace("\xa0", " ")
    text = re.sub(r"[ \t\r\n]+", " ", text)
    text = re.sub(rf" ?{CESURA} ?", CESURA, text)
    return text.strip()


def note_ids(stanza: Tag, page: str, number: int | None) -> list[str]:
    """Footnotes belonging to a stanza.

    Markers on the stanza number are always kept (one note can cover several
    stanzas). Markers inside the lines are kept only when the note is named for
    this stanza: elsewhere they are artifacts of where the scanned page broke.
    """
    ids = []
    own_prefix = f"cite_note-{page}_{number}-" if number is not None else None
    for anchor in stanza.select("sup.reference a[href^='#cite_note']"):
        note_id = anchor["href"][1:]
        on_number = anchor.find_parent(class_="ws-poem-versenum") is not None
        if not on_number and (own_prefix is None or not note_id.startswith(own_prefix)):
            continue
        if note_id not in ids:
            ids.append(note_id)
    return ids


def notes_by_id(soup: BeautifulSoup) -> dict[str, str]:
    notes = {}
    for item in soup.select("ol.references > li[id]"):
        for backlink in item.select(".mw-cite-backlink"):
            backlink.decompose()
        notes[item["id"]] = clean(item.get_text())
    return notes


def introduction(soup: BeautifulSoup) -> list[str]:
    """Paragraphs of Bellows' introductory note, which precede the first stanza."""
    paragraphs: list[str] = []
    started = False
    for element in soup.find_all(["p", "div"]):
        classes = element.get("class") or []
        if "ws-poem-stanza" in classes:
            break
        if element.name != "p":
            continue
        text = clean(element.get_text())
        if text == "Introductory Note":
            started = True
            continue
        if started and text:
            paragraphs.append(text)
    return paragraphs


def parse(poem_id: str, html: str) -> dict:
    page, title, english_title = POEMS[poem_id]
    soup = BeautifulSoup(html, "html.parser")
    notes = notes_by_id(soup)
    intro = introduction(soup)

    stanzas: list[dict] = []
    for div in soup.select("div.ws-poem-stanza"):
        number_el = div.select_one(".ws-poem-versenum")
        match = re.match(r"\s*(\d+)\.", number_el.get_text()) if number_el else None
        if number_el is not None and not match:
            raise ValueError(f"{poem_id}: unexpected stanza number {number_el.get_text()!r}")
        number = int(match.group(1)) if match else (stanzas[-1]["n"] if stanzas else None)
        ids = note_ids(div, page, number)
        lines = []
        for line in div.select(".ws-poem-line"):
            text = line_text(line)
            if re.fullmatch(r"[*\s\u2003]+", text):
                text = GAP  # Bellows marks lost or omitted lines with asterisks
            if text:
                lines.append({"text": text, "indent": line.select_one(".ws-poem-indent") is not None})
        stanza_notes = [notes[i] for i in ids if i in notes]

        if number_el is None:
            # A stanza split across two scanned pages: continue the previous one.
            if not stanzas:
                raise ValueError(f"{poem_id}: continuation before first stanza")
            stanzas[-1]["lines"].extend(lines)
            stanzas[-1]["notes"].extend(n for n in stanza_notes if n not in stanzas[-1]["notes"])
            continue

        stanzas.append({"n": number, "lines": lines, "notes": stanza_notes})

    if not stanzas:
        raise ValueError(f"{poem_id}: no stanzas found")
    numbers = [s["n"] for s in stanzas]
    if len(set(numbers)) != len(numbers):
        raise ValueError(f"{poem_id}: duplicate stanza numbers")
    if any(not s["lines"] for s in stanzas):
        raise ValueError(f"{poem_id}: empty stanza")

    return {
        "id": poem_id,
        "title": title,
        "englishTitle": english_title,
        "translator": "Henry Adams Bellows",
        "year": 1923,
        "license": "Public domain",
        "source": BASE_URL + page,
        "introduction": intro,
        "stanzas": stanzas,
    }


def parse_old_norse(poem_id: str) -> dict[int, list[dict]]:
    """Read a transcription file: stanza number, then lines; '|' marks the caesura, '>' an indented line."""
    text = (OLD_NORSE_DIR / f"{poem_id}.txt").read_text(encoding="utf-8")
    stanzas: dict[int, list[dict]] = {}
    for block in re.split(r"\n\s*\n", text.strip()):
        rows = block.strip().split("\n")
        if not rows[0].strip().isdigit():
            raise ValueError(f"{poem_id}: block without a stanza number: {rows[0]!r}")
        number = int(rows[0])
        lines = []
        for row in rows[1:]:
            indent = row.startswith(">")
            body = row[1:] if indent else row
            body = re.sub(r"^\.{6,}$", "\u2026" * 3, body.strip())
            lines.append({"text": body.replace("|", CESURA), "indent": indent})
        if number in stanzas or not lines:
            raise ValueError(f"{poem_id}: duplicate or empty stanza {number}")
        stanzas[number] = lines
    expected = list(range(1, len(stanzas) + 1))
    if sorted(stanzas) != expected:
        raise ValueError(f"{poem_id}: stanza numbers are not 1..{len(stanzas)}")
    return stanzas


def attach_old_norse(poem: dict) -> None:
    old = parse_old_norse(poem["id"])
    order = OLD_NORSE_ORDER.get(poem["id"], {})
    if len(old) != len(poem["stanzas"]):
        raise ValueError(f"{poem['id']}: {len(old)} Old Norse stanzas but {len(poem['stanzas'])} English")
    for stanza in poem["stanzas"]:
        source_number = order.get(stanza["n"], stanza["n"])
        stanza["original"] = old[source_number]
        if source_number != stanza["n"]:
            stanza["originalNumber"] = source_number
    poem["original"] = {"language": "non", **OLD_NORSE_EDITION}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cache", type=Path, required=True, help="directory for downloaded pages")
    parser.add_argument("--out", type=Path, default=Path("src/content/poems"))
    args = parser.parse_args()

    args.cache.mkdir(parents=True, exist_ok=True)
    args.out.mkdir(parents=True, exist_ok=True)
    for poem_id, (page, _, _) in POEMS.items():
        poem = parse(poem_id, fetch(page, args.cache))
        attach_old_norse(poem)
        out = args.out / f"{poem_id}.json"
        out.write_text(json.dumps(poem, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"{out}: {len(poem['stanzas'])} stanzas, {sum(len(s['notes']) for s in poem['stanzas'])} notes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
