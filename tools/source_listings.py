#!/usr/bin/env python3
"""
source_listings.py — Stub for Bigfoot Blueprint Bot 2 (Apify Actor Builder) equivalent.

Reads a seed query CSV → calls scraping API → emits raw listing rows.

This is a stub. Real implementation requires:
  - Apify token (env: APIFY_TOKEN) — sign up at console.apify.com ($5 free credit)
  - Google Places API key (env: GOOGLE_PLACES_KEY) — console.cloud.google.com
  - or Outscraper key (env: OUTSCRAPER_KEY) — outscraper.com (~$3/1000 records)

Usage:
  python3 tools/source_listings.py --query "ติวเตอร์ คณิต ม.1 กรุงเทพ" --out .tmp/raw_listings.csv

Output: CSV with L1 (BASE) fields per content.config.ts listing schema.
"""
import argparse
import csv
import json
import os
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Source raw listings from scraping APIs")
    parser.add_argument("--query", required=True, help="Search query in Thai or English")
    parser.add_argument("--source", default="google_places", choices=["google_places", "outscraper", "apify_facebook"])
    parser.add_argument("--out", default=".tmp/raw_listings.csv")
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Stub: emit empty CSV with correct headers for the data pipeline to flow
    fieldnames = [
        "name_th", "address_th", "lat", "lng", "city", "district",
        "phone", "website", "email", "facebook_url",
        "google_rating", "google_review_count", "source",
    ]

    if args.source == "google_places" and not os.environ.get("GOOGLE_PLACES_KEY"):
        print("⚠  GOOGLE_PLACES_KEY not set. Stub mode — emitting empty CSV.", file=sys.stderr)
        print("   Get key at: https://console.cloud.google.com/apis/credentials", file=sys.stderr)
    elif args.source == "outscraper" and not os.environ.get("OUTSCRAPER_KEY"):
        print("⚠  OUTSCRAPER_KEY not set. Stub mode — emitting empty CSV.", file=sys.stderr)
        print("   Get key at: https://outscraper.com", file=sys.stderr)
    elif args.source == "apify_facebook" and not os.environ.get("APIFY_TOKEN"):
        print("⚠  APIFY_TOKEN not set. Stub mode — emitting empty CSV.", file=sys.stderr)
        print("   Get token at: https://console.apify.com", file=sys.stderr)

    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        # Real implementation would iterate over scrape results here

    print(f"✓ Wrote empty CSV scaffold to {out_path}")
    print(f"  Query: {args.query}  Source: {args.source}  Limit: {args.limit}")
    print("  Add the relevant API key to .env then re-run to populate.")


if __name__ == "__main__":
    main()
