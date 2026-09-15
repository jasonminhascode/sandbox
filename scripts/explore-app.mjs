import { chromium, devices } from "playwright";

const BASE = "https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices["iPhone 13"],
    locale: "en-US",
  });
  const page = await context.newPage();

  page.on("console", (msg) => console.log("CONSOLE:", msg.text()));
  page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));

  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  console.log("URL after load:", page.url());
  await page.screenshot({ path: "/tmp/01-landing.png", fullPage: true });

  // Try to find sign-in
  const signIn = page.getByRole("link", { name: /sign in|log in/i }).or(
    page.getByRole("button", { name: /sign in|log in/i })
  );
  if (await signIn.count()) {
    await signIn.first().click();
    await page.waitForTimeout(2000);
    console.log("URL after sign-in click:", page.url());
    await page.screenshot({ path: "/tmp/02-signin.png", fullPage: true });
  }

  // Clerk login form
  const username = page.locator('input[name="identifier"], input[type="email"], input[autocomplete="username"]').first();
  if (await username.isVisible({ timeout: 5000 }).catch(() => false)) {
    await username.fill("jason");
    const continueBtn = page.getByRole("button", { name: /continue/i });
    if (await continueBtn.count()) await continueBtn.click();
    await page.waitForTimeout(1500);

    const password = page.locator('input[name="password"], input[type="password"]').first();
    if (await password.isVisible({ timeout: 5000 }).catch(() => false)) {
      await password.fill("AStarTemp2026!x");
      const submit = page.getByRole("button", { name: /continue|sign in/i });
      if (await submit.count()) await submit.click();
      await page.waitForTimeout(4000);
    }
  }

  console.log("URL after login:", page.url());
  await page.screenshot({ path: "/tmp/03-after-login.png", fullPage: true });

  // Collect nav links
  const links = await page.locator("a[href]").evaluateAll((els) =>
    els.map((a) => ({ href: a.getAttribute("href"), text: a.textContent?.trim().slice(0, 60) }))
  );
  console.log("Links:", JSON.stringify(links.slice(0, 30), null, 2));

  const buttons = await page.locator("button").evaluateAll((els) =>
    els.map((b) => b.textContent?.trim().slice(0, 60)).filter(Boolean)
  );
  console.log("Buttons:", buttons.slice(0, 20));

  // Try common routes
  const routes = ["/yard", "/sweeper", "/auctions", "/lots", "/home", "/app", "/dashboard"];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    console.log(`Route ${route}:`, page.url());
    await page.screenshot({ path: `/tmp/route-${route.replace(/\//g, "")}.png` });
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
