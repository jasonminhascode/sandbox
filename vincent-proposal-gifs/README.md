# Vincent proposal GIFs — A-Star / JesusCruz tip (Yard Finder)

Proposal-ready animated GIFs captured from the live tip:

https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app

Mobile viewport **390×844**, exported ~**390×844** looping GIFs via Playwright video + ffmpeg two-pass palette.

## Files

| GIF | Motion |
|---|---|
| `yard-swipe-like.gif` | Slow Yard swipe like (drag + fly-off → watchlist) |
| `priority-star.gif` | Priority / Star (Super Like equivalent) → Auctions Priority sheet |
| `lot-open.gif` | Open lot profile sheet (strong motion) |
| `yard-swipe-pass.gif` | Slow Yard swipe pass (bonus) |
| `gallery-flick.gif` | Horizontal gallery flick inside lot (bonus) |

See `PROOF.md` for ffprobe frame counts, durations, and sizes.

## Reproduce

```bash
npm install playwright
npx playwright install chromium
node capture.js   # or recapture scripts in this folder
# then ffmpeg two-pass as in finalize.sh / convert-gifs.sh
```

## Notes for Keith / Vincent

- Auth: tip accepts `jason` / `AStarTemp2026!x` (and `demo` / `keith` accounts per login copy).
- Priority is the product’s star / “Super Like” analogue.
