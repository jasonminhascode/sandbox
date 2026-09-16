# 1. GovDeals maestro.lqdt1.com — LIVE proof

**Status:** `LIVE`  
**Harvest method:** `vmFetch` (server-side HTTP POST, no browser)  
**Last success:** 2026-09-16T00:25:31Z  
**Fixture:** `fixtures/govdeals-maestro-search-street-sweeper.json`

## Proof summary

GovDeals inventory is served by Liquidity Services' **Maestro** JSON API. The Angular storefront sits behind Akamai Bot Manager, but the search endpoint is reachable anonymously with the `x-api-key` shipped in the public JS bundle.

| Check | Result |
|-------|--------|
| Endpoint | `POST https://maestro.lqdt1.com/search/list` |
| Auth | `x-api-key` (anonymous), `x-user-id: -1` |
| HTTP | 200 |
| `x-total-count` | 43 for `searchText=street sweeper` |
| Freightliner M2 in page 1 | Yes — 2019 M2, category `94N` / "Sweeper - Street" |
| Browser required? | **No** |

## Request shape (from scumola/govdeals `scraper.example.py` + live validation)

```json
{
  "businessId": "GD",
  "searchText": "street sweeper",
  "page": 1,
  "displayRows": 10,
  "categoryIds": "",
  "isQAL": false,
  "facets": []
}
```

Required headers: `Content-Type: application/json`, `Origin: https://www.govdeals.com`, `Referer: https://www.govdeals.com/`, `x-api-key`, `x-user-id`, correlation IDs.

## Related Maestro endpoints (Apify scrapersdelight docs)

| Endpoint | Purpose | Notes |
|----------|---------|-------|
| `/search/list` | Search grid | **Primary harvest** |
| Asset detail | quantity, gallery, terms | Enrichment |
| Bid box | current bid, buyer premium, watchers | Live bid snapshot |

## Pack contract mapping

| Field | Maestro source |
|-------|----------------|
| `lotId` | `{accountId}-{assetId}` |
| `title` | `assetShortDescription` |
| `make` / `model` | `makebrand`, `model`, `modelYear` |
| `category` | `categoryDescription` (e.g. Sweeper - Street) |
| `currentBid` | `currentBid` (bid box may be fresher) |
| `endAt` | `assetAuctionEndDateUtc` |
| `location` | `locationCity`, `locationState`, `locationZip` |
| `photos` | `photo` → `https://webassets.lqdt1.com/ecomm/media/image/{photo}` |

## Honesty rules

- `currentBid` is a **snapshot** at fetch time, not a websocket feed.
- Closed lots may linger in search briefly — product should use `dropEndedLots` + `assetAuctionEndDateUtc`.
- API key **rotates** with JS deploys; adapter must bootstrap from bundle or fail loudly.
- Proximity/radius search returns nothing for anonymous callers (documented by scrapersdelight).

## Steal vs ignore

| Steal | Ignore |
|-------|--------|
| POST `/search/list` adapter | Legacy CFM HTML (`AuctionChecker`) |
| Category code `94N` for street sweepers | Akamai storefront scraping |
| Bid-box enrichment for buyer premium | Auto-snipe / login flows |
| scumola scoring UX (separate spike) | Assuming VIN on every lot (~15% fill unfiltered) |

## ToS / license

- No OSS license on Maestro API itself.
- Third-party actors (Apify) disclaim GovDeals affiliation.
- Anonymous API use is what the site ships to browsers; still review Liquidity Services terms before production scale.

## Spike script

`scripts/probe-govdeals-maestro.py` — re-runnable live probe.
