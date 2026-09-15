import { chromium, devices } from "playwright";
import { execSync } from "child_process";
import { mkdirSync, existsSync, unlinkSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const BASE = "https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app";
const OUT_DIR = join(process.cwd(), "vincent-proposal-gifs");
const TMP_DIR = "/tmp/gif-capture";
const AUTH_STATE = join(TMP_DIR, "auth.json");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(TMP_DIR, { recursive: true });

const DEVICE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: devices["iPhone 13"].userAgent,
};

async function ensureAuth(browser) {
  if (existsSync(AUTH_STATE)) return;

  const context = await browser.newContext(DEVICE);
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("#operator-identifier").fill("jason");
  await page.locator("#operator-password").fill("AStarTemp2026!x");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  await page.waitForTimeout(2000);
  await context.storageState({ path: AUTH_STATE });
  await context.close();
  console.log("Auth state saved.");
}

function webmToGif(webmPath, gifPath, { fps = 15, width = 600, trimStart = 0, trimDuration = 5 } = {}) {
  const scale = `scale=${width}:-2:flags=lanczos`;
  const trim = `-ss ${trimStart} -t ${trimDuration}`;
  const palette = join(TMP_DIR, `palette-${Date.now()}.png`);

  execSync(
    `ffmpeg -y ${trim} -i "${webmPath}" -vf "${scale},fps=${fps},palettegen=stats_mode=diff" "${palette}"`,
    { stdio: "pipe" }
  );
  execSync(
    `ffmpeg -y ${trim} -i "${webmPath}" -i "${palette}" -lavfi "${scale},fps=${fps} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=3" -loop 0 "${gifPath}"`,
    { stdio: "pipe" }
  );
  try {
    unlinkSync(palette);
  } catch {
    /* ignore */
  }
}

function probeGif(gifPath) {
  const frames = execSync(
    `ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "${gifPath}"`,
    { encoding: "utf8" }
  ).trim();
  const duration = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${gifPath}"`,
    { encoding: "utf8" }
  ).trim();
  const size = execSync(`stat -c%s "${gifPath}"`, { encoding: "utf8" }).trim();
  const wxh = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${gifPath}"`,
    { encoding: "utf8" }
  ).trim();
  return {
    frames: parseInt(frames, 10),
    duration: parseFloat(duration),
    sizeBytes: parseInt(size, 10),
    dimensions: wxh,
  };
}

function newestWebm(dir) {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f, t: execSync(`stat -c %Y "${join(dir, f)}"`, { encoding: "utf8" }).trim() }))
    .sort((a, b) => Number(b.t) - Number(a.t));
  return files.length ? join(dir, files[0].f) : null;
}

async function capture(browser, name, setupFn, actionFn, opts = {}) {
  const { recordMs = 4500, trimDuration = 4.5, width = 600, fps = 15 } = opts;
  const gifPath = join(OUT_DIR, `${name}.gif`);

  const context = await browser.newContext({
    ...DEVICE,
    storageState: AUTH_STATE,
    recordVideo: { dir: TMP_DIR, size: { width: 390, height: 844 } },
    locale: "en-US",
  });
  const page = await context.newPage();

  try {
    if (setupFn) await setupFn(page);
    await page.waitForTimeout(600);

    const actionPromise = actionFn(page);
    await Promise.all([actionPromise, page.waitForTimeout(recordMs)]);
    await page.waitForTimeout(200);
  } finally {
    await page.close();
    const video = page.video();
    const srcPath = video ? await video.path() : newestWebm(TMP_DIR);
    await context.close();

    if (!srcPath || !existsSync(srcPath)) {
      throw new Error(`No webm recorded for ${name}`);
    }

    const webmPath = join(TMP_DIR, `${name}.webm`);
    execSync(`cp "${srcPath}" "${webmPath}"`);

    // Trim to action window (video is short since we skip login)
    const fullDur = parseFloat(
      execSync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${webmPath}"`,
        { encoding: "utf8" }
      ).trim()
    );
    const trimStart = Math.max(0, fullDur - trimDuration - 0.2);
    const actualTrim = Math.min(trimDuration, fullDur - trimStart);

    webmToGif(webmPath, gifPath, { fps, width, trimStart, trimDuration: actualTrim });
    const stats = probeGif(gifPath);
    console.log(
      `${name}: ${stats.frames} frames, ${stats.duration.toFixed(2)}s, ${stats.dimensions}, ${(stats.sizeBytes / 1024).toFixed(0)}KB`
    );
    return { name, gifPath, ...stats };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  await ensureAuth(browser);

  const reports = [];

  reports.push(
    await capture(browser,
      "01-yard-swipe-like",
      async (page) => {
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const box = await getCardBox(page);
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height * 0.35;
        await page.mouse.move(cx, cy);
        await page.waitForTimeout(150);
        await page.mouse.down();
        for (let i = 0; i <= 45; i++) {
          const t = i / 45;
          const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          await page.mouse.move(cx + ease * 200, cy - ease * 35);
          await page.waitForTimeout(32);
        }
        await page.mouse.up();
        await page.waitForTimeout(800);
      },
      { recordMs: 4000, trimDuration: 3.8, width: 600, fps: 18 }
    )
  );

  reports.push(
    await capture(browser,
      "02-super-like-star",
      async (page) => {
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const star = await findStarButton(page);
        await star.click({ force: true });
        await page.waitForTimeout(2800);
      },
      { recordMs: 4000, trimDuration: 3.8, width: 600, fps: 18 }
    )
  );

  reports.push(
    await capture(browser,
      "03-auctions-board-enter",
      async (page) => {
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(800);
      },
      async (page) => {
        await page.getByRole("link", { name: /^Auctions$/i }).click();
        await page.waitForLoadState("networkidle").catch(() => {});
        await page.waitForTimeout(1200);
        await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
        await page.waitForTimeout(1800);
      },
      { recordMs: 4500, trimDuration: 4.2, width: 600, fps: 15 }
    )
  );

  reports.push(
    await capture(browser,
      "04-lot-gallery-open",
      async (page) => {
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const imgs = page.locator("img");
        const count = await imgs.count();
        // Tap main card area
        const box = await getCardBox(page);
        await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.3);
        await page.waitForTimeout(1500);
        if (count > 1) {
          const thumbBox = await imgs.nth(0).boundingBox();
          if (thumbBox) {
            await page.mouse.move(thumbBox.x + thumbBox.width / 2, thumbBox.y + thumbBox.height / 2);
            await page.mouse.down();
            for (let i = 0; i <= 18; i++) {
              await page.mouse.move(thumbBox.x + thumbBox.width / 2 - i * 14, thumbBox.y + thumbBox.height / 2);
              await page.waitForTimeout(45);
            }
            await page.mouse.up();
          }
        }
        await page.waitForTimeout(1000);
      },
      { recordMs: 5000, trimDuration: 4.5, width: 600, fps: 15 }
    )
  );

  reports.push(
    await capture(browser,
      "05-yard-swipe-pass",
      async (page) => {
        await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
        await page.waitForTimeout(1500);
      },
      async (page) => {
        const box = await getCardBox(page);
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height * 0.35;
        await page.mouse.move(cx, cy);
        await page.waitForTimeout(150);
        await page.mouse.down();
        for (let i = 0; i <= 45; i++) {
          const t = i / 45;
          const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          await page.mouse.move(cx - ease * 200, cy - ease * 25);
          await page.waitForTimeout(32);
        }
        await page.mouse.up();
        await page.waitForTimeout(800);
      },
      { recordMs: 4000, trimDuration: 3.8, width: 600, fps: 18 }
    )
  );

  await browser.close();

  writeFileSync(join(OUT_DIR, "capture-report.json"), JSON.stringify(reports, null, 2));
  console.log("\n=== FINAL REPORT ===");
  for (const r of reports) {
    const ok = r.frames > 1 ? "✓ ANIMATED" : "✗ STATIC";
    console.log(`${ok} ${r.name}: ${r.frames} frames, ${r.duration}s, ${r.dimensions}`);
  }
}

async function getCardBox(page) {
  const selectors = [
    '[class*="rounded-3xl"]',
    '[class*="aspect-[3/4]"]',
    "main img",
    "img",
  ];
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    const box = await el.boundingBox().catch(() => null);
    if (box && box.width > 100) return box;
  }
  throw new Error("Card not found");
}

async function findStarButton(page) {
  const byAria = page.getByRole("button", { name: /star|super|priority|boost/i });
  if (await byAria.count()) return byAria.first();

  const rounded = page.locator("button.rounded-full, button[class*='rounded-full']");
  const count = await rounded.count();
  for (let i = 0; i < count; i++) {
    const html = await rounded.nth(i).innerHTML();
    if (/star|M11\.049|polygon.*star/i.test(html)) return rounded.nth(i);
  }
  // Fallback: 3rd action button (undo=0, pass=1, star=2)
  if (count >= 3) return rounded.nth(2);
  throw new Error("Star button not found");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
