import { chromium, devices } from "playwright";

const BASE = "https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app";

async function login(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  if (!page.url().includes("/login")) {
    console.log("Already logged in or no login required:", page.url());
    return;
  }

  const identifier = page.locator(
    'input[name="identifier"], input[name="username"], input[type="email"], input[autocomplete="username"]'
  ).first();
  await identifier.waitFor({ state: "visible", timeout: 15000 });
  await identifier.fill("jason");
  await page.waitForTimeout(500);

  const continueBtn = page.locator('button:has-text("Continue"), .cl-formButtonPrimary').first();
  await continueBtn.click({ timeout: 10000 });
  await page.waitForTimeout(1500);

  const password = page.locator('input[type="password"]').first();
  await password.waitFor({ state: "visible", timeout: 10000 });
  await password.fill("AStarTemp2026!x");
  await page.waitForTimeout(500);

  const submit = page.locator('button:has-text("Continue"), .cl-formButtonPrimary').first();
  await submit.click({ timeout: 10000 });
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30000 });
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await context.newPage();
  await login(page);
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  const allButtons = await page.locator("button").evaluateAll((els) =>
    els.map((b) => ({
      text: b.textContent?.trim(),
      aria: b.getAttribute("aria-label"),
      testId: b.getAttribute("data-testid"),
      class: (b.className || "").toString().slice(0, 100),
    }))
  );
  console.log("Buttons:", JSON.stringify(allButtons, null, 2));

  const imgs = await page.locator("img").evaluateAll((els) =>
    els.map((img) => ({
      alt: img.alt,
      src: img.src?.slice(0, 80),
      w: img.width,
      h: img.height,
    }))
  );
  console.log("Images:", JSON.stringify(imgs.slice(0, 5), null, 2));

  // Card-like elements
  for (const sel of ['[data-testid*="card"]', '[class*="Card"]', '[class*="card"]', '[class*="swipe"]', '[class*="stack"]']) {
    const n = await page.locator(sel).count();
    if (n) console.log(`${sel}: ${n}`);
  }

  const mainCard = page.locator('[class*="card"], [class*="Card"], [class*="stack"] > div').first();
  const cardBox = await mainCard.boundingBox().catch(() => null);
  const imgBox = await page.locator("img").first().boundingBox();
  console.log("Card box:", cardBox, "Img box:", imgBox);

  const box = cardBox || imgBox;
  if (box) {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height * 0.4;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    for (let i = 0; i <= 25; i++) {
      await page.mouse.move(cx + i * 10, cy - i * 1.5);
      await page.waitForTimeout(40);
    }
    await page.mouse.up();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "/tmp/after-drag-right.png" });
  }

  // Star button - aria-label often used
  const star = page.getByRole("button", { name: /star|super|priority|boost/i });
  if (await star.count()) {
    console.log("Found star by aria:", await star.count());
    await star.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "/tmp/after-star.png" });
  } else {
    // Try 3rd action button in row (star between X and heart)
    const actionBtns = page.locator('button.rounded-full, button[class*="rounded-full"]');
    const count = await actionBtns.count();
    console.log("Rounded buttons:", count);
    for (let i = 0; i < count; i++) {
      const info = await actionBtns.nth(i).evaluate((b) => ({
        aria: b.getAttribute("aria-label"),
        html: b.innerHTML.slice(0, 100),
      }));
      console.log(`Action btn ${i}:`, info);
    }
    if (count >= 3) {
      await actionBtns.nth(2).click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: "/tmp/after-star-click.png" });
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
