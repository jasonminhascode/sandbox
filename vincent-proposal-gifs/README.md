# Vincent NorthStar Proposal — A-Star Tip Product GIFs

Animated GIFs for Keith Crum's Vincent NorthStar sales proposal showcasing Jesus Cruz / A-Star skeleton app motion.

**Preview target:** https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app  
**Repo context:** MagicGenies/JesusCruz `tip product/eod-2026-09-02` (a-star-skeleton)

## Tool choice

| Option | Verdict |
|--------|---------|
| [pagecast](https://github.com/mcpware/pagecast) | Not installed; adds MCP + Playwright dependency chain |
| [testreel](https://github.com/sneg55/testreel) | JSON scenario runner; extra setup for one-off capture |
| [gifsmith](https://github.com/AkshitIreddy/gifsmith) | Agent demo framework; heavier than needed |
| **Playwright + ffmpeg (chosen)** | Already on VM (`npx playwright`, `/usr/bin/ffmpeg`). Records WebM via Playwright `recordVideo`, converts with ffmpeg two-pass `palettegen`/`paletteuse`. |

**Why Playwright + ffmpeg:** Zero new dependencies beyond `npm install playwright`, full control over mobile viewport (390×844), auth reuse via `storageState`, and reliable animated GIF output validated with `ffprobe`.

## GIF catalog

| File | Motion | Frames | Duration | Size |
|------|--------|--------|----------|------|
| `01-yard-swipe-like.gif` | Slow right swipe (like) on sweeper lot card — card tilts and flies off | 38 | 3.8s | ~5.3 MB |
| `02-super-like-star.gif` | Star tap → **On Auctions Priority** celebration sheet | 46 | 3.8s | ~1.3 MB |
| `03-auctions-board-enter.gif` | Nav to Auctions tab + smooth scroll through sale cards | 50 | 4.2s | ~1.8 MB |
| `04-lot-gallery-open.gif` | Card tap → stack transition to next lot (gallery flick) | 46 | 3.8s | ~4.3 MB |
| `05-yard-swipe-pass.gif` | Slow left swipe (pass) on lot card | 38 | 3.8s | ~5.3 MB |

All GIFs verified **animated** (`nb_read_packets` > 1 via ffprobe).

## Public raw URLs

After push to `jasonminhascode/sandbox` on branch `cursor/vincent-proposal-gifs-063f`:

```
https://raw.githubusercontent.com/jasonminhascode/sandbox/cursor/vincent-proposal-gifs-063f/vincent-proposal-gifs/01-yard-swipe-like.gif
https://raw.githubusercontent.com/jasonminhascode/sandbox/cursor/vincent-proposal-gifs-063f/vincent-proposal-gifs/02-super-like-star.gif
https://raw.githubusercontent.com/jasonminhascode/sandbox/cursor/vincent-proposal-gifs-063f/vincent-proposal-gifs/03-auctions-board-enter.gif
https://raw.githubusercontent.com/jasonminhascode/sandbox/cursor/vincent-proposal-gifs-063f/vincent-proposal-gifs/04-lot-gallery-open.gif
https://raw.githubusercontent.com/jasonminhascode/sandbox/cursor/vincent-proposal-gifs-063f/vincent-proposal-gifs/05-yard-swipe-pass.gif
```

## Regenerate

```bash
npm install
npx playwright install chromium

# Capture all GIFs (login: jason / AStarTemp2026!x)
node scripts/capture-gifs.mjs

# Optional: re-encode for smaller file size
bash scripts/optimize-gif.sh /tmp/gif-capture/01-yard-swipe-like.webm vincent-proposal-gifs/01-yard-swipe-like.gif 480 10 3.8 0
```

### Settings used

- Viewport: 390×844 (iPhone 13 profile), `deviceScaleFactor: 3`
- Theme: dark (app default on Yard)
- Output width: 480–540px (within Keith's 480–720 embed range)
- ffmpeg: two-pass palette (`palettegen=stats_mode=diff`, `paletteuse=dither=bayer`)

## Auth

Smoke login saved to `/tmp/gif-capture/auth.json` during capture:

- Username: `jason`
- Password: `AStarTemp2026!x`

Allowed accounts on login screen: `demo`, `keith`, `jason`.
