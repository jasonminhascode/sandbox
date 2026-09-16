# Headed infra + TruckPaper email ingest

## TruckPaper / MachineryTrader — email+SMS ingest

**HTML scrape:** `BLOCKED` (Cloudflare 403 from datacenter)  
**Recommended path:** `PARTIAL` via account alerts — not Cloudflare HTML fight

### Alert setup

| Site | Sweeper category ID | URL pattern |
|------|---------------------|-------------|
| TruckPaper | 16049 | `/listings/for-sale/sweeper-trucks/16049` |
| MachineryTrader | 103 | `/listings/for-sale/sweeper/103` |

Configure Sandhills account alerts: category + FREIGHTLINER make + email/SMS.

### Ingest architecture

```
Sandhills alerts → dedicated inbox (IMAP) or SMS webhook (Twilio)
  → parse listing URL / numeric ID from notification body
  → normalize to canonical listing store
  → dedupe by listingId
```

**Gets:** new listing notifications, partial title/price/location  
**Missing:** full spec, sold state, all photos (unless fetched separately)

---

## Headed infra comparison (PARTIAL harvest only)

Scope: Municibid CF, IronPlanet PDP WAF, RB IP block. **NOT Copart Imperva bypass.**

| Tool | Type | Best for | Verdict |
|------|------|----------|---------|
| **Camoufox** | Firefox fork, C++ FP spoof | Hardest CF (Municibid) | PARTIAL — heavy ops |
| **Patchright** | Playwright Chromium patch | IronPlanet PDP, general WAF | Best OSS compromise |
| **Crawlee + fingerprint-suite** | Node orchestration | Session rotation pipelines | PARTIAL — not raw stealth |
| **Steel.dev** | Hosted/self-hosted browser API | Fast session pool (~0.9s) | LIVE infra tier |
| **Browserbase** | Managed browsers | Prod debugging, SOC2 | LIVE — slower cold start |
| **Hyperbrowser** | Agent-native cloud | MCP/agent workflows | PARTIAL |
| **Kernel** | Performance browser cloud | High parallel PARTIAL | LIVE — ~0.8s sessions |

### Tier recommendation

| Tier | Method | Targets |
|------|--------|---------|
| 0 | Plain vmFetch | GovDeals Maestro, IronPlanet c=3226, GSA GraphQL |
| 1 | Patchright + residential | Municibid, IronPlanet PDP |
| 2 | Steel/Kernel hosted | Scale tier 1 |
| 3 | Email ingest | TruckPaper, MachineryTrader |

**Do not use headed infra for GovDeals category harvest** — already LIVE without browser.

---

## GovAuctions.app /sources

Aggregator index of 39 platforms (59k+ lots). Useful for **source discovery**, not primary harvest API.

- GovDeals: 24,809 live, 100% photo coverage (their score)
- Municibid: 377 live
- GSA Fleet: 1,726 live
- Purple Wave / Public Surplus: overlap with product #433

Label: **MIRROR** meta-index — link to original source for bids.
