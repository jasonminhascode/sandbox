# 3. COPART_MIRROR — bid.cars-api, Apibara, API Auctions

**Status for all below:** `MIRROR` until Copart `grant-session` path is `LIVE`  
**Rule:** Do not claim LIVE-from-Copart from any third-party index.

## Lock lot fixture: copart-79175225

| Field | Value |
|-------|-------|
| Copart lot | 79175225 |
| bid.cars lot | `1-79175225` |
| VIN (indexed) | `1FVACWFE3RHVH5984` |
| Title | 2024 Freightliner M2 / M2 106 Medium Duty |
| "Lock" | Likely **keys absent** (`Has key: No`), not software lock — not live-verified (Cloudflare) |
| Sweeper? | **Not labeled sweeper** — plain medium-duty chassis |

Use as regression fixture for M2 parsing + key signaling, not sweeper classification.

---

## bid.cars + bid.cars-api (GitHub)

**Site label:** `MIRROR` / **BLOCKED** for automated fetch (Cloudflare 403)  
**Repo:** `AhsanRiaz786/bid.cars-api` — Flask + SQLite, MIT-ish utility

### Architecture (from repo)

```
GET /api/lookup?vin= → cache → bid.cars
  GET /app/search/en/vin-lot/{VIN}/false  (JSON)
  GET /en/lot/1-{lot}/...                 (HTML parse)
```

- `curl_cffi` chrome impersonation, 1 req/sec  
- **VIN-in only** — no make/model inventory crawl  
- Steal: cache-first VIN history archive pattern  
- Ignore: primary discovery for "all M2 sweepers this week"

**Proposed role:** `COPART_MIRROR` enrichment after Apibara/API Auctions discovery.

---

## Apibara (apibara.tech)

**Label:** `MIRROR`  
**License:** Proprietary API ToS  
**Free tier:** 100 req/mo, no card  

### Endpoints

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/v1/vehicle-auction/vehicles` | Search active inventory |
| GET | `/api/v1/vehicle-auction/vehicles/{slugVin}` | Detail |
| GET | `/api/v1/vehicle-auction/vehicles/{slugVin}/history` | History |

Search params: `platform=copart|iaai`, `make`, `model`, `s=keyword`, `lot_sub_status=Open`

**Public probe:** 401 without key; OpenAPI + status.json public.

### Freightliner M2 + unlabeled sweeper this week?

| Query | Expected |
|-------|----------|
| `make=Freightliner&model=M2&platform=copart` | Yes (with API key) |
| Unlabeled sweeper chassis | **Partial** — `s=sweeper`, `s=Elgin`, photo review only |
| Live bids | ~10–15s refresh where supported; not grant-session |

**Steal:** First paid eval — burn 100 free calls, validate field shape.  
**Ignore:** As sole sweeper finder (no equipment-body taxonomy).

---

## API Auctions / apicars.auction

**Label:** `MIRROR` (apicars.auction = marketing alias, same backend)  
**Free tier:** 10 req/hr, card required  

### Endpoints

| Method | Path | Use |
|--------|------|-----|
| POST | `/api/v2/get-active-lots` | Active lots, `car_info_vehicle_type=TRUCK` |
| POST | `/api/v2/get-cars` | History |
| POST | `/api/v2/vin-decoding` | NHTSA decode |

**Steal:** High-frequency active polling (Active Lots Pro $150/mo, 3 RPS).  
**Ignore:** Second stack if Apibara already integrated (~80% overlap).

---

## apicars.auction

Identical to apiauctions.io — **ignore as separate vendor**.

---

## YapCar

**Label:** `ABSENT` for auction data  
`yapcar.co.kr` is unrelated (Korean game). No US salvage API or damage-photo UX product found.  
**Ignore entirely** for data path. Optional UX bench-mark from GEICO/Ravin inspection flows instead.

---

## Keith answer: which paid API for M2 + unlabeled sweeper lots this week?

| Vendor | M2 this week | Unlabeled sweeper-shaped | Price + ToS |
|--------|--------------|--------------------------|-------------|
| **Apibara** | Yes (`make`+`model`) | Keyword + photo pass only | Free 100/mo; commercial from $25/mo; independent indexer ToS |
| **API Auctions** | Yes + `TRUCK` filter | Same keyword limitation | Card for free; Active Lots $150/mo |
| **bid.cars-api** | VIN-only after discovery | No crawl | Self-host ~$5/mo VPS; scrape ToS risk |
| **Grant-session Copart** | Authoritative | Photos + notes | Not in scope — only path to `LIVE` |

**Recommendation:** Trial **Apibara** first (no card). If polling volume matters, add **API Auctions Active Lots Pro**. Layer **bid.cars-api** for VIN history. Photo classifier for unlabeled M2 chassis.

### Suggested trial queries (once keyed)

```
GET /vehicles?platform=copart&make=Freightliner&model=M2&lot_sub_status=Open
GET /vehicles?s=sweeper&make=Freightliner
POST /api/v2/get-active-lots?make=Freightliner&model=M2&car_info_vehicle_type=TRUCK
```
