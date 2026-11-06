#!/usr/bin/env python3
"""Import poems from Henry Adams Bellows' translation of the Poetic Edda (1923).

Bellows' translation was published in 1923 and is in the public domain. The
text is taken from the proofread transcription on English Wikisource:
https://en.wikisource.org/wiki/The_Poetic_Edda_(tr._Bellows)

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


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cache", type=Path, required=True, help="directory for downloaded pages")
    parser.add_argument("--out", type=Path, default=Path("src/content/poems"))
    args = parser.parse_args()

    args.cache.mkdir(parents=True, exist_ok=True)
    args.out.mkdir(parents=True, exist_ok=True)
    for poem_id, (page, _, _) in POEMS.items():
        poem = parse(poem_id, fetch(page, args.cache))
        out = args.out / f"{poem_id}.json"
        out.write_text(json.dumps(poem, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"{out}: {len(poem['stanzas'])} stanzas, {sum(len(s['notes']) for s in poem['stanzas'])} notes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
