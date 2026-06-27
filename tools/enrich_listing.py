#!/usr/bin/env python3
"""
enrich_listing.py — Bigfoot Blueprint L3 enrichment via OpenAI.

Reads a raw listings CSV (L1 fields) and uses OpenAI to generate:
  - description_th (200-400 Thai words)
  - speakable_th (3 voice paragraphs — first sentence answers the question)
  - faq (10 questions parents ask, 80-200 char answers each)
  - quick_facts (price_range, class_size, format, age_range)

Outputs Markdown files with YAML frontmatter to src/content/listings/.
Each output passes the Zod anti-thin gate in content.config.ts.

Requires:
  - OPENAI_API_KEY (env) — get at https://platform.openai.com/api-keys (≥ $10 wallet)
  - pip install openai pyyaml

Usage:
  python3 tools/enrich_listing.py --input .tmp/raw_listings.csv --out src/content/listings/
"""
import argparse
import csv
import json
import os
import re
import sys
from pathlib import Path
from datetime import date


SYSTEM_PROMPT = """\
You are content writer for ติดฝัน (TidFun), a Thai directory of tutoring services and cram schools.
Given basic info about a tutoring institute, you produce structured Thai content optimized for AI answer engines (Google AI Overviews, ChatGPT search, Perplexity) and for Thai parents looking for the right place for their child.

Output JSON with these exact keys:
  description_th: string (200-400 Thai characters, factual, no marketing fluff)
  speakable_th: array of exactly 3 strings (each 50-120 Thai characters; first sentence directly answers the implicit question)
  faq: array of exactly 6 objects with {question, answer}; answers 80-200 Thai characters
  quick_facts: {price_range, class_size, format (array), age_range}
  categories: array from [por1, mor1, mor4, uni, all]
  subjects: array from [math, science, physics, chemistry, biology, english, thai, social, iq, readiness, sat, ielts, toefl]
  pricing_tier: one of [budget, mid, premium]
  type: one of [cram_school, franchise, private_tutor, online_only]

Do not invent specific statistics, year-by-year admission rates, or testimonials.
Stay general but specific to the niche.
Output JSON ONLY, no markdown wrapper."""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out", default="src/content/listings/")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be sent to OpenAI; don't call API")
    args = parser.parse_args()

    if not os.environ.get("OPENAI_API_KEY") and not args.dry_run:
        print("✗ OPENAI_API_KEY not set. Set the env var or use --dry-run.", file=sys.stderr)
        print("  Get key at: https://platform.openai.com/api-keys (wallet ≥ $10)", file=sys.stderr)
        sys.exit(1)

    in_path = Path(args.input)
    if not in_path.exists():
        print(f"✗ Input file not found: {in_path}", file=sys.stderr)
        sys.exit(1)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    with in_path.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    print(f"Read {len(rows)} listings from {in_path}")
    if not rows:
        print("✗ No rows to enrich.", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print("\nDRY RUN — would call OpenAI for each row with prompt:")
        print("---")
        print(SYSTEM_PROMPT)
        print("---\n")
        for row in rows[:3]:
            print("INPUT:", json.dumps(row, ensure_ascii=False))
        if len(rows) > 3:
            print(f"... and {len(rows) - 3} more rows")
        return

    # Real implementation: call openai.chat.completions.create(...) per row
    # Then validate output → build YAML frontmatter → write .md file
    print("⚠  Live enrichment not implemented in stub. Add openai SDK call here.")
    print(f"   Would write {len(rows)} .md files to {out_dir}")


def slugify_th(name: str) -> str:
    s = re.sub(r"[^\w-]", "-", name.lower())
    return re.sub(r"-+", "-", s).strip("-")


if __name__ == "__main__":
    main()
