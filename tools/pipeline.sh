#!/usr/bin/env bash
# pipeline.sh — Bigfoot §3 STEP 3-6 full automated pipeline.
#
# Source (Apify) → Enrich (OpenAI) → Validate → Build → Commit → Push
#
# Usage:
#   bash tools/pipeline.sh               # default queries
#   bash tools/pipeline.sh --skip-source # if .tmp/gmaps_merged.csv exists
#   bash tools/pipeline.sh --dry-run     # build + validate without committing
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; source .env; set +a; fi
: "${APIFY_TOKEN:?APIFY_TOKEN not set}"
: "${OPENAI_API_KEY:?OPENAI_API_KEY not set}"

if [ ! -d .venv ]; then
  echo "═══ Creating .venv with pyyaml ═══"
  python3 -m venv .venv
  .venv/bin/pip install --quiet pyyaml
fi
export PATH=".venv/bin:${PATH}"
echo "Using Python: $(which python3) ($(python3 --version 2>&1))"

SKIP_SOURCE=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --skip-source) SKIP_SOURCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
  esac
done

mkdir -p .tmp

if [ "$SKIP_SOURCE" = "0" ]; then
  echo "═══ Phase 1: Source (Apify Google Maps) — Scale to 1,000+ ═══"

  # 38 untapped provinces × 10 = ~380 records
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Maha Sarakham, Thailand" --limit 10 --out .tmp/msk.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Roi Et, Thailand" --limit 10 --out .tmp/re.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Kalasin, Thailand" --limit 10 --out .tmp/kal.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Chaiyaphum, Thailand" --limit 10 --out .tmp/cy.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Si Sa Ket, Thailand" --limit 10 --out .tmp/ss.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Surin, Thailand" --limit 10 --out .tmp/sur.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Nakhon Phanom, Thailand" --limit 10 --out .tmp/np2.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Mukdahan, Thailand" --limit 10 --out .tmp/mh.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Yasothon, Thailand" --limit 10 --out .tmp/ys.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Nong Khai, Thailand" --limit 10 --out .tmp/nk.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Bueng Kan, Thailand" --limit 10 --out .tmp/bk.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Amnat Charoen, Thailand" --limit 10 --out .tmp/ac.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Mae Hong Son, Thailand" --limit 10 --out .tmp/mhs.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Phayao, Thailand" --limit 10 --out .tmp/py.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Nan, Thailand" --limit 10 --out .tmp/nan.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Phrae, Thailand" --limit 10 --out .tmp/pr.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Uttaradit, Thailand" --limit 10 --out .tmp/utd.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Sukhothai, Thailand" --limit 10 --out .tmp/sk.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Tak, Thailand" --limit 10 --out .tmp/tak.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Kamphaeng Phet, Thailand" --limit 10 --out .tmp/kp.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Phichit, Thailand" --limit 10 --out .tmp/phc.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Phetchabun, Thailand" --limit 10 --out .tmp/phb.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Saraburi, Thailand" --limit 10 --out .tmp/sar.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Singburi, Thailand" --limit 10 --out .tmp/sb.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Nakhon Nayok, Thailand" --limit 10 --out .tmp/nn.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Nakhon Sawan, Thailand" --limit 10 --out .tmp/nsw.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Kanchanaburi, Thailand" --limit 10 --out .tmp/knc.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Ratchaburi, Thailand" --limit 10 --out .tmp/rt.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Chachoengsao, Thailand" --limit 10 --out .tmp/chc.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Chanthaburi, Thailand" --limit 10 --out .tmp/cha.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Trat, Thailand" --limit 10 --out .tmp/trt.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Sa Kaeo, Thailand" --limit 10 --out .tmp/skw.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Chumphon, Thailand" --limit 10 --out .tmp/chp.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Ranong, Thailand" --limit 10 --out .tmp/rn.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Phang Nga, Thailand" --limit 10 --out .tmp/pn.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Satun, Thailand" --limit 10 --out .tmp/st.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Pattani, Thailand" --limit 10 --out .tmp/pat.csv
  python3 tools/source_listings.py --query "สถาบันกวดวิชา" --location "Narathiwat, Thailand" --limit 10 --out .tmp/nr.csv

  # 12 subject niches × 10 = ~120 records
  python3 tools/source_listings.py --query "ติว HSK" --location "Bangkok, Thailand" --limit 10 --out .tmp/hsk.csv
  python3 tools/source_listings.py --query "ติว JLPT" --location "Bangkok, Thailand" --limit 10 --out .tmp/jlpt.csv
  python3 tools/source_listings.py --query "ติว GMAT" --location "Bangkok, Thailand" --limit 10 --out .tmp/gmat.csv
  python3 tools/source_listings.py --query "ติว GRE" --location "Bangkok, Thailand" --limit 10 --out .tmp/gre.csv
  python3 tools/source_listings.py --query "ติว IGCSE" --location "Bangkok, Thailand" --limit 10 --out .tmp/igcse.csv
  python3 tools/source_listings.py --query "ติวเรียนต่อต่างประเทศ" --location "Bangkok, Thailand" --limit 10 --out .tmp/study_abroad.csv
  python3 tools/source_listings.py --query "ติวภาษาเกาหลี" --location "Bangkok, Thailand" --limit 10 --out .tmp/korean.csv
  python3 tools/source_listings.py --query "ติวภาษาฝรั่งเศส" --location "Bangkok, Thailand" --limit 10 --out .tmp/french.csv
  python3 tools/source_listings.py --query "ติวภาษาเยอรมัน" --location "Bangkok, Thailand" --limit 10 --out .tmp/german.csv
  python3 tools/source_listings.py --query "ติวเภสัช" --location "Bangkok, Thailand" --limit 10 --out .tmp/pharm.csv
  python3 tools/source_listings.py --query "ติววิศวกรรม" --location "Bangkok, Thailand" --limit 10 --out .tmp/eng_uni.csv
  python3 tools/source_listings.py --query "ติวบัญชี" --location "Bangkok, Thailand" --limit 10 --out .tmp/account.csv

  # 15 existing-city deepen × 10 = ~150 records
  python3 tools/source_listings.py --query "ติวเตอร์" --location "Phitsanulok, Thailand" --limit 10 --out .tmp/d_pl.csv
  python3 tools/source_listings.py --query "ติวเตอร์" --location "Ubon Ratchathani, Thailand" --limit 10 --out .tmp/d_ub.csv
  python3 tools/source_listings.py --query "ติวเตอร์" --location "Udon Thani, Thailand" --limit 10 --out .tmp/d_ud.csv
  python3 tools/source_listings.py --query "ติวเตอร์" --location "Hat Yai, Thailand" --limit 10 --out .tmp/d_hy.csv
  python3 tools/source_listings.py --query "ติวเตอร์" --location "Phuket, Thailand" --limit 10 --out .tmp/d_pk.csv
  python3 tools/source_listings.py --query "ติวภาษาอังกฤษ" --location "Chiang Mai, Thailand" --limit 10 --out .tmp/d_cm_eng.csv
  python3 tools/source_listings.py --query "ติวภาษาอังกฤษ" --location "Khon Kaen, Thailand" --limit 10 --out .tmp/d_kk_eng.csv
  python3 tools/source_listings.py --query "ติวคณิตศาสตร์" --location "Chiang Mai, Thailand" --limit 10 --out .tmp/d_cm_math.csv
  python3 tools/source_listings.py --query "ติว IELTS" --location "Phuket, Thailand" --limit 10 --out .tmp/d_pk_ielts.csv
  python3 tools/source_listings.py --query "ติวคณิตศาสตร์" --location "Khon Kaen, Thailand" --limit 10 --out .tmp/d_kk_math.csv
  python3 tools/source_listings.py --query "ติวเตอร์ ม.1" --location "Bangkok, Thailand" --limit 10 --out .tmp/d_mor1.csv
  python3 tools/source_listings.py --query "ติวเตอร์ ป.6" --location "Bangkok, Thailand" --limit 10 --out .tmp/d_por6.csv
  python3 tools/source_listings.py --query "ติว ป.5" --location "Bangkok, Thailand" --limit 10 --out .tmp/d_por5.csv
  python3 tools/source_listings.py --query "ติว ม.3" --location "Bangkok, Thailand" --limit 10 --out .tmp/d_mor3.csv
  python3 tools/source_listings.py --query "ติวภาษาจีน" --location "Chiang Mai, Thailand" --limit 10 --out .tmp/d_cm_ch.csv

  echo "═══ Merge CSVs ═══"
  FIRST=$(ls .tmp/*.csv | head -1)
  head -1 "$FIRST" > .tmp/gmaps_merged.csv
  for f in .tmp/*.csv; do
    [ "$f" = ".tmp/gmaps_merged.csv" ] && continue
    tail -n +2 "$f" >> .tmp/gmaps_merged.csv
  done
  echo "  $(wc -l < .tmp/gmaps_merged.csv) rows (incl. header)"
fi

echo
echo "═══ Phase 2: Enrich (OpenAI gpt-4o) ═══"
python3 tools/enrich_listing.py \
  --input .tmp/gmaps_merged.csv \
  --model gpt-4o \
  --skip-existing \
  --out src/content/listings/

echo
echo "═══ Phase 3: Validate (anti-thin gate) ═══"
python3 tools/validate_listings.py

echo
echo "═══ Phase 4: Build ═══"
PATH=/usr/local/bin:$PATH npx astro build 2>&1 | tail -5

if [ "$DRY_RUN" = "1" ]; then
  echo "═══ Dry run — not committing ═══"
  exit 0
fi

NEW_COUNT=$(git status --porcelain src/content/listings/ | grep -c "^??")
if [ "$NEW_COUNT" = "0" ]; then
  echo "No new listings to commit."
  exit 0
fi

echo
echo "═══ Phase 5: Commit + Push ═══"
git add src/content/listings/
git commit -m "Add ${NEW_COUNT} enriched listings (Apify → OpenAI pipeline)

Sourced from Google Maps via Apify, enriched to L3 via OpenAI gpt-4o.
All listings pass the Zod anti-thin gate.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
"
STASHED=0
if ! git diff-index --quiet HEAD --; then
  git stash push -u -m "pipeline-autostash"
  STASHED=1
fi
git pull --rebase origin main
git push origin main
if [ "$STASHED" = "1" ]; then
  git stash pop || true
fi

echo
echo "✓ Pipeline complete. Cloudflare rebuild in 3-10 min."
