# 2. Municibid + GSA Fleet — PARTIAL → LIVE adapters

## Municibid

**Status:** `PARTIAL`  
**Harvest method:** Headed browser + US residential proxy (datacenter blocked)  
**Last probe:** 2026-09-16 — Cloudflare 301/challenge on `municibid.com/browse`

### Endpoints (HTML, no public JSON API)

| Pattern | Example |
|---------|---------|
| Keyword browse | `/browse?FullTextQuery=street+sweeper&StatusFilter=active_only` |
| Listing detail | `/Listing/Details/{8-digit-id}/{slug}` |
| Category path | `/Browse/R3777797-R3777810-C160883/` |

### Keyword seeds

`street sweeper`, `sweeper`, `Freightliner M2`, `Elgin`, `Tymco`, `Schwarze`

### Adapter path

1. Patchright/Camoufox + residential proxy  
2. Parse list view for listing ID, title, bid, end time, seller  
3. Optional detail page for gallery  
4. Monitor mode: dedupe by 8-digit listing ID  

**Graduation blockers:** No fixture pack from datacenter vmFetch; Cloudflare prevents honest `LIVE` label today.

### Apify reference

`scrapersdelight/municibid-scraper` — Browse API wrapper, `$4/1k`, monitor mode. Label as **MIRROR** if used via Apify.

---

## GSA Fleet Marketplace (`marketplace.gsafleet.gov`)

**Status:** `PARTIAL` (API is LIVE; sweeper taxonomy ABSENT)  
**Harvest method:** `vmFetch` GraphQL  
**Last success:** 2026-09-16  
**Fixture:** `fixtures/gsa-fleet-graphql-freightliner.json`

### Public GraphQL gateway

```
POST https://api.shared-public.gsafleet.gov/graphql/shared-public-gateway
```

No auth required for browse queries verified this session.

### Working queries

**Filter metadata** — `getVehicleListingAllFilterValues` (make/model/vehicleType enums)

**Browse** — `getVehicleListingDetails(limit, offset, filters)`  
- 24,816 total rows observed (unfiltered count)  
- Freightliner filter: 30 rows, models include `M2 106`, `M2 112`  
- **No sweeper vehicleType** — closest: `Medium-Heavy Cab and Chassis`, `Fuel-WaterTrucks`, `Utility Trucks`

**Detail** — `getVehicleDetailsByVin(vin: String!)` includes `comments` field for keyword post-filter

### Config flag

`publicOpenSearchToggleFlag: false` — UI keyword search disabled; cannot query `sweeper` directly via public API.

### Adapter strategy for Cruz keywords

```
1. Filter makeName IN ["FREIGHTLINER"] AND modelName LIKE "%M2%"
2. Filter saleEventStatus IN ["Active", "Coming soon"]
3. For each VIN → getVehicleDetailsByVin → regex comments/title for sweeper brands
4. Paginate offset until hasMore=false
```

**Honesty:** GSA rows are **chassis fleet units**, not labeled sweepers. Cascadia ≠ M2. Do not Headroom-score without evalGate + citations.

### Separate from legacy GSA Auctions

`gsaauctions.gov` / GSA Auctions API = general federal surplus, different inventory pool from GSA Fleet vehicle sales.

---

## Comparison

| Source | vmFetch today | Sweeper taxonomy | M2 discovery |
|--------|---------------|------------------|--------------|
| Municibid | BLOCKED (CF) | Title keywords | PARTIAL via FullTextQuery |
| GSA Fleet | LIVE GraphQL | ABSENT | LIVE via make/model filter |
