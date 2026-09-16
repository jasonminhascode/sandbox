# Handoff note — one adapter spike for product

**From:** Cruz research spike (sandbox repo, `cruz-research-spike/`)  
**To:** Jason — merge owner on `product/eod-*` / MagicGenies when ready  
**Date:** 2026-09-16  
**Rule:** One-way handoff. Never merge research into product from this PR. Never fork JesusCruz.

---

## Recommended ONE adapter spike for product

### **GovDeals Maestro JSON adapter**

**Why this one**

1. **Graduated LIVE** — vmFetch proof + fixture + tests in this spike  
2. **Sweeper taxonomy** — category `94N` "Sweeper - Street" + keyword search returns Freightliner M2 (43 hits for "street sweeper" on 2026-09-16)  
3. **No browser, no login, no Copart wall** — lowest ops/ToS friction of all Cruz targets  
4. **Complements product #433** — Purple Wave + Public Surplus PARTIAL already shipped; GovDeals is the largest gov surplus pool (~25k live per GovAuctions.app)  
5. **Enrichment path clear** — bid-box endpoint for buyer premium (steal from scrapersdelight field list)

**Not recommended as first merge**

| Alternative | Why defer |
|-------------|-----------|
| Copart MIRROR (Apibara) | Requires API key trial + remains MIRROR until grant-session |
| IronPlanet c=3226 | Strong #2 — commercial equipment, different pack shape; no buyer premium in quickviews |
| Municibid | BLOCKED from vmFetch; headed + CF first |
| GSA Fleet GraphQL | PARTIAL — no sweeper taxonomy, chassis-only |

---

## What product should implement

```
Adapter: govdeals_maestro
Status: LIVE (harvestMethod: vmFetch)
Poll: POST maestro.lqdt1.com/search/list
  - searchText: sweeper | street sweeper | Freightliner M2
  - categoryIds: 94N (optional tighten)
Bootstrap: x-api-key from GovDeals JS bundle (rotate-safe)
Enrich: bid-box API for buyer_premium_pct, bid_increment
Normalize: accountId-assetId lot key, assetAuctionEndDateUtc ENDED logic
Honesty: dropEndedLots on live shelf; PARTIAL ≠ LIVE
```

### Fields to map first (MVP)

- `lotId`, `title`, `make`, `model`, `year`, `category`
- `currentBid`, `buyerPremiumPct`, `bidIncrement`
- `endAtUtc`, `timeRemaining`
- `city`, `state`, `zip`
- `photoUrls`, `sourceUrl` (`govdeals.com/asset/{assetId}/{accountId}`)

### Steal from research (not reimplement)

- scumola `analyzer.py` scoring weights → evalGate UX layer  
- scrapersdelight buyer premium / watcher fields → money honesty  
- rebrowser field names → Copart pack when MIRROR layer added later  

---

## Keith FAQ (from this spike)

| Question | Answer |
|----------|--------|
| Which paid API returns Freightliner M2 + unlabeled sweeper lots this week? | **Apibara** (trial 100/mo, no card) or **API Auctions** (card, better polling). Both **MIRROR**. M2 via make/model; unlabeled sweepers via keyword + photo review only. |
| GovDeals JSON fixture without browser? | **Yes.** `POST maestro.lqdt1.com/search/list` — fixture in `fixtures/govdeals-maestro-search-street-sweeper.json`. |
| steal vs ignore OSS? | See `findings/07-oss-apify-deep-dive.md`. Top steal: Maestro adapter shape, rebrowser schema, scumola scoring, omar-owis diff. Top ignore: IAAI apikey spoof, Copart login automation, snipe repos. |

---

## Graduation artifacts included

| Artifact | Path |
|----------|------|
| Fixture pack | `fixtures/govdeals-maestro-search-street-sweeper.json` |
| Honesty label | LIVE + vmFetch |
| Test | `scripts/test_fixtures.py` |
| Live probe | `scripts/probe-govdeals-maestro.py` |
| Spec | `findings/05-source-status-spec.md` |

---

## Explicit non-goals (this handoff)

- No Convex dual-write  
- No a-star-sweeping.vercel.app attachment  
- No Imperva/Copart login automation  
- No auto-snipe / bid  
- No Facebook scrape  
- No PR against JesusCruz  

Jason owns merge timing onto `product/eod-2026-09-02` lineage when canonical repo `MagicGenies/jesus-cruz-research` access lands.
