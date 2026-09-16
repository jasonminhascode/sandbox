# OSS / Apify deep-dive — steal vs ignore

Research-only. Read actual code/docs where accessible. Maps to pack contract labels.

## Summary table

| Repo / Actor | License | Status | Steal | Ignore | ToS risk |
|--------------|---------|--------|-------|--------|----------|
| AdsTable/car-aggregator | None | ARCHIVE | Unified Offer schema, Scrapy chain | Dead IAAI apikey, no Copart XSRF | High |
| rebrowser/copart-dataset | Custom NC | MIRROR | Field dictionary, title/damage enums | Scraping code (absent) | Medium |
| rebrowser/iaai-dataset | Custom NC | MIRROR | IAAI enums, geo fields | Premium fields in free tier | Medium |
| aaronata/AuctionChecker | None | MIRROR/legacy | Dedupe key, multi-source dict | CFM GovDeals HTML (dead) | Medium |
| scumola/govdeals | MIT | PARTIAL UX | Scoring formula, LLM two-pass | CLI/snipe, example scraper only | Low UX / Med API |
| omar-owis/copart-scraper | MIT | MIRROR | SQLite diff change-detect | Selenium DOM scrape | High |
| PawDevUK/profit-radar | — | ABSENT | Concept: calendar→CSV pipeline | Repo 404 | High |
| rbuddy101/car-sniper | ISC partial | PARTIAL→LIVE intent | XSRF bootstrap, update poll loop | HTML IAAI, Windows paths | High |
| bukhtyarhaider/carscube-ai | None | ABSENT data | Gemini damage JSON schema | No auction ingest | Low |
| fatima598/ASPIRE | None | ABSENT data | Rule-based part cost table | Rental YOLO weights | Low |
| lulzasaur/govdeals-scraper | Apify $ | MIRROR | Maestro `/search/list` proof | Pay-per-result at scale | Medium |
| jungle_synthesizer/govdeals-scraper | Apify $ | MIRROR | State/category filters | Redundant with above | Medium |
| scrapersdelight/govdeals-auction-scraper | Apify $ | MIRROR | buyer_premium_pct, watchers, category expansion | Vendor lock-in | Medium |
| scrapersdelight/publicsurplus-scraper | Apify $ | MIRROR | monitorMode alert pattern | Shallow vs dedicated | Medium |
| scrapersdelight/municibid-scraper | Apify $ | MIRROR | Municipal surplus monitor shell | CF on direct fetch | Medium |
| scrapersdelight/multi-auction-search | Apify $ | MIRROR | Cross-site normalized row | 8 sites shallow | Medium |
| memo23/copart-scraper (Apify) | Apify $ | MIRROR | Mobile API path reference | Residential proxy cost | High |

## Per-repo notes

### AdsTable/car-aggregator

- **Steal:** `Offer` model fields, damage normalizers in `map.py`, Celery+Scrapyd scheduling.
- **Ignore:** Embedded IAAI Firebase credentials; Copart without session.
- **Pack:** Copart PARTIAL, IAAI BLOCKED.

### rebrowser datasets

- **Steal:** Parquet field docs as canonical normalization target for MIRROR Copart/IAAI packs.
- **Ignore:** Assuming free GitHub samples are production-fresh.
- **Pack:** MIRROR; premium fields PARTIAL.

### scumola/govdeals (scoring UX only — NO snipe)

- **Steal:** `analyzer.py` weights — profit %, condition, distance, bid competition; recommendation enum.
- **Ignore:** 56KB CLI, MySQL, snipe patterns in DESIGN.md.
- **Pack:** Scoring PARTIAL; ingestion use Maestro directly.

### omar-owis/copart-scraper

- **Steal:** New/Updated/Removed diff on SQLite snapshots.
- **Ignore:** Selenium as primary Copart path.
- **Pack:** MIRROR + diff.

### car-sniper

- **Steal:** Playwright intercept for `x-xsrf-token`; poll `lotdetails/solr/{id}` for bid changes.
- **Ignore:** IAAI HTML split parsing.
- **Pack:** Copart LIVE intent (poll), not grant-session.

### carscube-ai + ASPIRE

- **Steal:** Vision enrichment contracts for Packet C damage (Gemini schema / YOLO cost table).
- **Ignore:** As auction discovery sources.
- **Pack:** Enrichment PARTIAL only.

### Apify GovDeals actors

All confirm **Maestro JSON** path. scrapersdelight adds landed-cost fields (`buyer_premium_pct`) critical for honest money — product Purple Wave adapter should mirror this pattern.

### memo23/copart-scraper (Apify only)

- Mobile `/srch/` + `/lots-api/v1/lot-details` — alternative bot surface.
- **High ToS risk** — label MIRROR only.

## Missing repos

| Requested | Status |
|-----------|--------|
| PawDevUK/profit-radar | 404 private/deleted |
| memo23/copart-scraper GitHub | 404 — Apify actor only |
| scrapersdelight/govdeals-auction-scraper GitHub | 404 — Apify only |

## Cross-cutting steal list (lowest risk)

1. rebrowser field dictionaries → pack schema
2. GovDeals Maestro POST body + headers → LIVE adapter
3. omar-owis diff pattern → monitor mode
4. scumola scoring weights → evalGate UX (not auto-buy)
5. carscube-ai JSON schema → damage vision enrichment

## Cross-cutting ignore list

1. IAAI mobile API key spoofing
2. Copart Puppeteer login / CSV export
3. Auto-snipe / car-sniper bid automation
4. Facebook scrape (explicitly out of scope)
5. Dual-write to product Convex from research
