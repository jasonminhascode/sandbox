# 5. Source-status enum spec

Canonical honesty labels for Cruz/A-Star pack contract. A spike graduates only with fixture + label + test + handoff note.

## Enum

```typescript
type SourceHarvestStatus =
  | "LIVE"      // vmFetch returns real inventory/bids without browser login
  | "PARTIAL"   // Some fields or paths work; gaps documented
  | "MIRROR"    // Third-party index or snapshot; not grant-session Copart/IAAI
  | "BLOCKED"   // WAF, Cloudflare, IP ban, or login wall prevents harvest
  | "ABSENT";   // No API/path exists for this capability
```

## Required metadata (every adapter row)

```typescript
interface SourceStatusRecord {
  source: string;              // e.g. "govdeals", "copart_mirror_apibara"
  status: SourceHarvestStatus;
  lastSuccessAt: string | null; // ISO-8601 UTC
  harvestMethod: "vmFetch" | "headedBrowser" | "emailIngest" | "apifyMirror" | "manual";
  endpoint?: string;           // canonical URL or GraphQL operation
  notes?: string;              // honesty caveats
}
```

## Label decision tree

```
Can vmFetch return live open lots without login?
  YES → Are bids/end times authoritative?
    YES → LIVE
    NO  → PARTIAL (document snapshot lag)
  NO → Is third-party index of public listings?
    YES → MIRROR
  NO → Is path blocked by WAF/CF/IP?
    YES → BLOCKED
  NO → ABSENT
```

## Rules (from product honesty pack)

| Rule | Enforcement |
|------|-------------|
| PARTIAL ≠ LIVE | Never promote PARTIAL adapter to LIVE shelf without new proof |
| vmFetch ABSENT → never LIVE | Headed-only paths max PARTIAL |
| Cascadia ≠ M2 | Separate model filters; no fuzzy merge |
| Headroom only on evalGate PASS + citations | Scoring layer separate from harvest |
| Ended ISO → ENDED | Parse `assetAuctionEndDateUtc` / saleEndDate; not "Sale started" |
| dropEndedLots | Live shelves only |
| Priority/Star retain | Product concern — research preserves source IDs |
| MIRROR labeled MIRROR | Apibara, API Auctions, bid.cars, rebrowser datasets |
| No hallucinated money | Omit bid if null; never fabricate premium |

## Current source table (this spike)

| Source | Status | lastSuccessAt | harvestMethod |
|--------|--------|---------------|---------------|
| GovDeals Maestro | LIVE | 2026-09-16T00:25:31Z | vmFetch |
| IronPlanet c=3226 | LIVE | 2026-09-16T00:26:00Z | vmFetch |
| GSA Fleet GraphQL | PARTIAL | 2026-09-16T00:26:00Z | vmFetch |
| Municibid browse | PARTIAL | — | headedBrowser |
| Public Surplus | PARTIAL | — | vmFetch (product #433) |
| Purple Wave | PARTIAL | — | vmFetch (product #433) |
| Copart (Apibara) | MIRROR | — | vmFetch + API key |
| Copart (API Auctions) | MIRROR | — | vmFetch + API key |
| Copart (bid.cars) | MIRROR/BLOCKED | — | scrape / CF |
| Copart (grant-session) | ABSENT | — | manual playbook only |
| IAAI direct | BLOCKED | — | login wall |
| TruckPaper alerts | PARTIAL | — | emailIngest |
| Ritchie Bros unified | BLOCKED | — | IP forbidden |

## Fixture graduation checklist

- [ ] `_meta.status` matches enum
- [ ] `_meta.harvestMethod` set
- [ ] `_meta.fetchedAt` ISO UTC
- [ ] `scripts/test_fixtures.py` passes
- [ ] Handoff note names one recommended product adapter
