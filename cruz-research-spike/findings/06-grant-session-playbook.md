# 6. Grant-session playbook (DOC ONLY)

**Status:** Documentation only. No login automation. No Imperva/Copart wall burning in this spike.

## Purpose

Define how product later moves Copart/IAAI from `MIRROR` → `LIVE` using an authenticated member session ("grant-session"), without implementing it here.

## Preconditions

| Requirement | Owner |
|-------------|-------|
| Valid Copart/IAAI buyer account | Jason / ops |
| Legal review of member ToS | Legal |
| Secure credential storage (vault, not repo) | Infra |
| Session refresh monitoring | Product |

## Copart grant-session flow (conceptual)

```
1. Human logs in via official Copart member portal (or approved OAuth if available)
2. Session artifacts captured: cookies, x-xsrf-token, member ID
3. Store in secure vault; rotate on expiry
4. Server-side vmFetch uses session headers for:
   - POST /public/lots/search (authenticated fields)
   - GET /public/data/lotdetails/solr/{lotId}
5. Label source LIVE only while session valid + bids match spot checks
6. On 401/403 → downgrade to MIRROR or BLOCKED; alert ops
```

Reference patterns (do not copy blindly):

- `rbuddy101/car-sniper` — Playwright XSRF bootstrap (HIGH ToS risk)
- Product should prefer official integration if Copart offers API partnership

## IAAI grant-session flow (conceptual)

```
1. Member login at iaai.com
2. Capture session cookies + any mobile API tokens
3. Use only for fields unavailable in MIRROR index
4. Never spoof rebrowser/car-aggregator hardcoded apikeys
```

## What grant-session unlocks vs MIRROR

| Field | MIRROR (Apibara) | LIVE (grant-session) |
|-------|------------------|----------------------|
| Open lot catalog | Yes | Yes |
| Current bid | Delayed snapshot | Near-real-time |
| Buyer premium / fees | Partial | Authoritative |
| Keys present | Sometimes | Authoritative |
| Member-only photos | Partial | Full |
| Bid placement | **Never in research spike** | Out of scope |

## Safety rules

1. **No auto-snipe / auto-bid** in research or first adapter
2. **No credential commits** — env/vault only
3. **No shared JesusCruz product credentials** — separate Cruz research account
4. **Rate limit** — human-scale polling, not DDoS
5. **Fail loud** — session expiry → BLOCKED label, not silent stale data
6. **Do not ping Jesus** for Copart access during research phase

## Downgrade matrix

| Signal | New status |
|--------|------------|
| Session valid, bids match | LIVE |
| Session valid, search only | PARTIAL |
| Session expired | BLOCKED |
| Using Apibara only | MIRROR |
| No Copart coverage | ABSENT |

## Handoff to product

When Jason merges an adapter:

1. Implement vault-backed session provider interface
2. Keep MIRROR fallback when session BLOCKED
3. Never dual-write Convex from research spike
4. Single-way handoff: research fixtures → product adapter PR on `product/eod-*` branch

## Related product context

Product tip `product/eod-2026-09-02` @ 77d815e already shipped Purple Wave, Public Surplus PARTIAL, Packet C retail/Headroom, damage vision, honest ENDED clocks, lifecycle validity — grant-session is **additive** for Copart LIVE, not a rewrite.
