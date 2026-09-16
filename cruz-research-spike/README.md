# Cruz / A-Star research spike

**Lane:** RESEARCH ONLY — parallel to product. Do not merge into `MagicGenies/JesusCruz` or `product/eod-2026-09-02`.

Throwaway spike until `MagicGenies/jesus-cruz-research` is visible to jasonminhascode.

**Canonical doc:** [Google Doc](https://docs.google.com/document/d/1VXRs-SGySWjRlnPdiT7E0DM4zshwhrqMuUjD83fyONo/edit)  
**Drive folder:** [Research Drive](https://drive.google.com/drive/folders/12OWkUvDzZcuuyKcDNFwvh1GwMHoPRiqU)

## Status table (2026-09-16)

| # | Source | Status | Harvest | Last success (UTC) | Fixture | Findings |
|---|--------|--------|---------|-------------------|---------|----------|
| 1 | GovDeals Maestro JSON | **LIVE** | vmFetch | 2026-09-16T00:25:31Z | [fixture](fixtures/govdeals-maestro-search-street-sweeper.json) | [01](findings/01-govdeals-maestro-live.md) |
| 2 | Municibid browse | **PARTIAL** | headedBrowser | — (CF blocked datacenter) | — | [02](findings/02-municibid-gsa-adapters.md) |
| 2 | GSA Fleet GraphQL | **PARTIAL** | vmFetch | 2026-09-16T00:26:00Z | [fixture](fixtures/gsa-fleet-graphql-freightliner.json) | [02](findings/02-municibid-gsa-adapters.md) |
| 3 | Copart MIRROR (Apibara / API Auctions / bid.cars) | **MIRROR** | vmFetch + key | — (401 without key) | — | [03](findings/03-copart-mirror-paid-apis.md) |
| 4 | IronPlanet / GovPlanet c=3226 | **LIVE** | vmFetch | 2026-09-16T00:26:00Z | [fixture](fixtures/ironplanet-quickviews-c3226-sample.json) | [04](findings/04-ironplanet-truckplanet.md) |
| 4 | TruckPlanet c=3226 | **PARTIAL** | vmFetch | redirect/no inventory | — | [04](findings/04-ironplanet-truckplanet.md) |
| 4 | Ritchie Bros unified | **BLOCKED** | — | IP forbidden | — | [04](findings/04-ironplanet-truckplanet.md) |
| 5 | Source-status enum | **SPEC** | — | — | — | [05](findings/05-source-status-spec.md) |
| 6 | Grant-session playbook | **DOC** | manual | — | — | [06](findings/06-grant-session-playbook.md) |
| — | OSS / Apify deep-dive | **RESEARCH** | — | — | — | [07](findings/07-oss-apify-deep-dive.md) |
| — | Headed infra / TruckPaper | **RESEARCH** | emailIngest | — | — | [08](findings/08-headed-infra-truckpaper.md) |

## Graduation criteria

A spike graduates with:

1. Fixture pack under `fixtures/`
2. Honesty label: `LIVE` | `PARTIAL` | `MIRROR` | `BLOCKED` | `ABSENT`
3. Test in `scripts/test_fixtures.py`
4. One-way handoff note → [HANDOFF.md](HANDOFF.md)

**Graduated this spike:** GovDeals Maestro (LIVE)

## Quick answers for Keith

| Question | Short answer |
|----------|--------------|
| Paid API for M2 + unlabeled sweeper this week? | **Apibara** (free 100/mo) or **API Auctions** — both **MIRROR**; M2 by make/model; unlabeled via keyword + photos |
| GovDeals JSON without browser? | **Yes** — `POST maestro.lqdt1.com/search/list` |
| Best OSS steal? | Maestro adapter, rebrowser schema, scumola scoring, omar-owis diff |
| Best OSS ignore? | IAAI apikey spoof, Copart login bots, snipe repos |

## Run probes

```bash
# Live GovDeals search
python3 cruz-research-spike/scripts/probe-govdeals-maestro.py "street sweeper"

# Fixture tests
python3 cruz-research-spike/scripts/test_fixtures.py -v
```

## Recommended product adapter

See [HANDOFF.md](HANDOFF.md) — **GovDeals Maestro JSON** first. Jason owns merge.

## Honesty rules (non-negotiable)

- PARTIAL ≠ LIVE  
- vmFetch ABSENT → never LIVE  
- Cascadia ≠ M2  
- Ended ISO → ENDED  
- MIRROR labeled MIRROR  
- No hallucinated money  
- No auto-snipe / no Copart login in research  

## Layout

```
cruz-research-spike/
├── README.md
├── HANDOFF.md
├── findings/          # Per-item research markdown
├── fixtures/          # JSON fixture packs with _meta
└── scripts/           # Probes + tests
```

## Product context (already shipped — do not touch)

`product/eod-2026-09-02` @ 77d815e: #433 Purple Wave + Public Surplus PARTIAL, #434 Packet C retail/Headroom, #435 damage vision, #436 ENDED clocks, #437 lifecycle, cron #428–432.
