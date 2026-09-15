import { chromium, devices } from "playwright";

const BASE = "https://a-star-skeleton-8rc6i15we-keith-fundgeniesas-projects.vercel.app";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  console.log("URL:", page.url());
  await page.screenshot({ path: "/tmp/login-debug.png", fullPage: true });

  const inputs = await page.locator("input").evaluateAll((els) =>
    els.map((i) => ({
      name: i.name,
      type: i.type,
      placeholder: i.placeholder,
      id: i.id,
    }))
  );
  console.log("Inputs:", inputs);

  const buttons = await page.locator("button").evaluateAll((els) =>
    els.map((b) => ({ text: b.textContent?.trim(), class: b.className?.slice?.(0, 60) }))
  );
  console.log("Buttons:", buttons);

  const bodyText = await page.locator("body").innerText();
  console.log("Body text:", bodyText.slice(0, 500));

  await browser.close();
}

main().catch(console.error);
