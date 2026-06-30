import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const OUT =
  "C:/Users/engra/AppData/Local/Temp/claude/e--Projects-iVendorz/3dc8ed6d-a8d2-4fd8-9525-8db5a75bd701/scratchpad";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("http://localhost:3001/previewpf", { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/platform-fixes-light.png`, fullPage: true });

const r = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
  .analyze();
const v = r.violations.map((x) => ({
  id: x.id,
  impact: x.impact,
  nodes: x.nodes.length,
  targets: x.nodes.flatMap((n) => n.target),
}));
console.log("AXE(light) violations:", v.length, JSON.stringify(v));

// headings present?
const headings = await page.evaluate(() =>
  Array.from(document.querySelectorAll("h1,h2,h3,h4")).map(
    (h) => `${h.tagName}:${h.textContent.trim().slice(0, 28)}`,
  ),
);
console.log("HEADINGS:", JSON.stringify(headings));
await browser.close();
