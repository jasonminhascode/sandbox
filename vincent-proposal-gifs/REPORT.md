# Capture Report — Vincent NorthStar Proposal GIFs

**Date:** 2026-09-15  
**Agent:** Cursor Cloud (side task for Keith Crum)  
**Target:** https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app

## ffprobe validation (animated proof)

```
01-yard-swipe-like.gif
  width=480 height=1038 r_frame_rate=10/1 nb_read_packets=38 duration=3.800000 size=5604460

02-super-like-star.gif
  width=540 height=1168 r_frame_rate=12/1 nb_read_packets=46 duration=3.830000 size=1311843

03-auctions-board-enter.gif
  width=540 height=1168 r_frame_rate=12/1 nb_read_packets=50 duration=4.160000 size=1830088

04-lot-gallery-open.gif
  width=540 height=1168 r_frame_rate=12/1 nb_read_packets=46 duration=3.830000 size=4489308

05-yard-swipe-pass.gif
  width=480 height=1038 r_frame_rate=10/1 nb_read_packets=38 duration=3.800000 size=5544353
```

**Result:** 5/5 GIFs have `nb_read_packets` ≥ 38 → all genuinely animated (not static).

## Visual QA summary

| GIF | Key moment captured | Pass |
|-----|---------------------|------|
| 01-yard-swipe-like | Card arcs right with visible tilt; next card peeks behind | ✓ |
| 02-super-like-star | Blue "On Auctions Priority" sheet with lot thumbnail + Open Auctions / Open lot CTAs | ✓ |
| 03-auctions-board-enter | Auctions International + Copart sale cards, bottom nav highlight | ✓ |
| 04-lot-gallery-open | Card stack transition — tap advances to Fort Pierce IAA lot | ✓ |
| 05-yard-swipe-pass | Card arcs left (pass motion) | ✓ |

No auth walls, error screens, or blank frames in trimmed segments.

## Tool path

**Selected:** Playwright `recordVideo` → ffmpeg `palettegen`/`paletteuse`  
**Rejected for this VM:** pagecast (MCP install overhead), testreel (scenario JSON boilerplate), gifsmith (framework setup).

## Notes for Keith's agents

- Swipe GIFs are larger (~5 MB) due to full-bleed photo motion; star/auctions GIFs are ~1–2 MB.
- Star action triggers the Priority sheet (not a particle burst) — this is the product's actual celebration UX.
- GIFs loop (`-loop 0`).
