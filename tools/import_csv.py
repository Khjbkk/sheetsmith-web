#!/usr/bin/env python3
"""
import_csv.py — Convert enriched listings CSV → Markdown files.

After tools/source_listings.py + tools/enrich_listing.py have produced a CSV
with full L1-L5 fields, this script writes one .md file per row in
src/content/listings/ that matches the Zod schema in content.config.ts.

Input CSV must have all required fields (see content.config.ts for the
authoritative schema). The script validates each row and skips invalid ones.

Usage:
  python3 tools/import_csv.py --input .tmp/enriched_listings.csv

Requires: pip install pyyaml
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Install: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


REQUIRED_TOP_LEVEL = [
    "name_th", "address_th", "city", "type",
    "description_th", "data_freshness_date",
]
LIST_FIELDS = ["phone", "categories", "subjects", "target_schools", "specialties", "sources"]
JSON_FIELDS = ["speakable_th", "faq", "quick_facts"]


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\-]+", "-", text.strip().lower())
    return re.sub(r"-+", "-", text).strip("-")[:60]


def parse_row(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if not v or v.strip() == "":
            continue
        v = v.strip()
        if k in LIST_FIELDS:
            out[k] = [s.strip() for s in v.split("|") if s.strip()]
        elif k in JSON_FIELDS:
            try:
                out[k] = json.loads(v)
            except json.JSONDecodeError as e:
                raise ValueError(f"field {k} must be JSON: {e}")
        elif k in ("lat", "lng", "google_rating"):
            out[k] = float(v)
        elif k in ("founded_year", "google_review_count"):
            out[k] = int(v)
        elif k in ("featured", "claimed"):
            out[k] = v.lower() in ("true", "1", "yes")
        else:
            out[k] = v
    return out


def validate(parsed: dict) -> list[str]:
    errors = []
    for k in REQUIRED_TOP_LEVEL:
        if k not in parsed:
            errors.append(f"missing required field: {k}")
    if "description_th" in parsed and len(parsed["description_th"]) < 200:
        errors.append(f"description_th too short ({len(parsed['description_th'])} chars; need ≥ 200)")
    sp = parsed.get("speakable_th", [])
    if not isinstance(sp, list) or len(sp) != 3:
        errors.append(f"speakable_th must be a JSON array of exactly 3 strings")
    elif any(len(s) < 50 for s in sp):
        errors.append("speakable_th items must each be ≥ 50 chars")
    faq = parsed.get("faq", [])
    if not isinstance(faq, list) or len(faq) < 5:
        errors.append(f"faq must have ≥ 5 items")
    elif any(len(f.get("answer", "")) < 80 for f in faq):
        errors.append("faq answers must each be ≥ 80 chars")
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", default="src/content/listings/")
    parser.add_argument("--skip-invalid", action="store_true", help="Skip rows that fail validation (default: stop)")
    args = parser.parse_args()

    in_path = Path(args.input)
    if not in_path.exists():
        print(f"✗ Input not found: {in_path}", file=sys.stderr)
        sys.exit(1)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    with in_path.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Read {len(rows)} rows from {in_path}")
    written = 0
    skipped = 0
    for i, row in enumerate(rows, 1):
        try:
            parsed = parse_row(row)
        except ValueError as e:
            print(f"✗ Row {i}: {e}", file=sys.stderr)
            skipped += 1
            if not args.skip_invalid:
                sys.exit(1)
            continue

        errors = validate(parsed)
        if errors:
            print(f"✗ Row {i} ({parsed.get('name_th','?')}): {'; '.join(errors)}", file=sys.stderr)
            skipped += 1
            if not args.skip_invalid:
                sys.exit(1)
            continue

        slug = parsed.get("slug") or slugify(parsed["name_th"])
        out_path = out_dir / f"{slug}.md"
        with out_path.open("w", encoding="utf-8") as f:
            f.write("---\n")
            f.write(yaml.dump(parsed, allow_unicode=True, sort_keys=False))
            f.write("---\n")
        written += 1

    print(f"✓ Wrote {written} listings; skipped {skipped}")


if __name__ == "__main__":
    main()
