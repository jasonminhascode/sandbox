# 4. IronPlanet / TruckPlanet / Ritchie Bros — sweeper harvest

**Primary status:** `LIVE` (category grid via vmFetch)  
**Detail enrichment:** `PARTIAL`  
**Fixture:** `fixtures/ironplanet-quickviews-c3226-sample.json`

## Category ID correction

| Param | Result | Label |
|-------|--------|-------|
| `c=226` | Wrong category, 0 sweepers | `ABSENT` |
| **`c=3226`** | "Sweeper Trucks For Sale", 60+ items/page | **`LIVE`** |
| `c=2260` | Oil and Gas Trucks | Wrong |

Use **`c=3226`** across IronPlanet, GovPlanet, TruckPlanet JSP stack.

## LIVE harvest path (no browser)

```
GET https://www.ironplanet.com/jsp/s/auction.ips?c=3226&sm=0&msg=0&sort=yr+desc&pg={n}
GET https://www.govplanet.com/jsp/s/auction.ips?c=3226&sm=0&msg=0
```

Parse embedded `<script>quickviews.push({...})</script>` blocks.

### Fields from quickviews (verified 2026-09-16)

- `equipId`, `description`, `convPrice`, `usage`, `features`
- `itemPageUri`, `bidUrl`, `photo`, `lat`/`lng`, `eumeLocation`
- Example: "2021 Schwarze M6SE on 2022 Freightliner M6 Sweeper Truck" — $129,000

## PARTIAL enrichment

| Endpoint | Status |
|----------|--------|
| `/jsp/equip/getEquipInfo.jsp?equipId={id}` | LIVE — VIN, meter, features |
| `/jsp/s/item/{id}` | BLOCKED — AWS WAF |
| `/jsp/s/search.ips?kw=sweeper` | BLOCKED — WAF |

## TruckPlanet

Same `c=3226` URL pattern. Probe returned redirect/no inventory — label **`PARTIAL`** (reuse IronPlanet adapter when inventory exists).

## Ritchie Bros (`rbauction.com`)

**BLOCKED** from datacenter IP ("Access Forbidden"). Headed + residential required; not primary path.

## Keyword filter (in-process)

After category harvest, filter titles/features:

```
/sweeper|street sweeper|elgin|tymco|schwarze|freightliner m2|m2 106/i
```

Note: IronPlanet lists **Freightliner M6** chassis too — do not conflate with M2.

## Pack contract mapping

| Pack field | quickviews source |
|------------|-------------------|
| `sourceId` | `equipId` |
| `title` | `description` |
| `price` | `convPrice` |
| `meter` | `usage` |
| `location` | `eumeLocation` |
| `photos` | `photo`, `photoBigger` |
| `url` | `itemPageUri` |

## Steal vs ignore

| Steal | Ignore |
|-------|--------|
| `auction.ips?c=3226` + quickviews parser | `c=226` |
| Optional getEquipInfo VIN enrichment | Full PDP HTML scrape from datacenter |
| GovPlanet same adapter | rbauction.com until residential IP sorted |
