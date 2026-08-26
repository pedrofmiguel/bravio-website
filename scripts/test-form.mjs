import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => m.type() === "error" && console.log("CONSOLE ERROR:", m.text()));
page.on("pageerror", (e) => console.log("PAGE ERROR:", e.message));

await page.goto("http://localhost:3000/contact", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

// The form sits inside a scroll reveal, so it is visibility:hidden until its
// ScrollTrigger fires. Scroll it into view before touching anything.
for (let i = 0; i < 5; i++) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(400);
}
await page.waitForTimeout(1200);

// 1. Submit empty: expect inline errors, no network call.
await page.getByRole("button", { name: /send enquiry|enviar pedido/i }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: OUT + "/1-validation.png" });
const errors = await page.locator("p.text-accent").allTextContents();
console.log("inline errors:", JSON.stringify(errors));
console.log("focused after submit:", await page.evaluate(() => document.activeElement?.getAttribute("name")));

// 2. Fill and submit properly.
await page.fill('input[name="name"]', "Ines Caetano");
await page.fill('input[name="email"]', "ines@example.pt");
await page.fill('input[name="guests"]', "8");
await page.fill('textarea[name="message"]', "Anniversary dinner for eight, in our house in Sintra.");
await page.screenshot({ path: OUT + "/2-filled.png" });
await page.getByRole("button", { name: /send enquiry|enviar pedido/i }).click();
await page.waitForTimeout(1800);
await page.screenshot({ path: OUT + "/3-success.png" });
console.log("success visible:", await page.locator("text=/Thank you|Obrigado/").isVisible());
await browser.close();
