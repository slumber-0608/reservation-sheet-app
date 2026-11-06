import { expect, test } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const months = [
  { year: 2027, month: 2, days: 28 },
  { year: 2024, month: 2, days: 29 },
  { year: 2026, month: 9, days: 30 },
  { year: 2026, month: 8, days: 31 },
];

test("年月・追加休日・プレビュー・同期印刷・代替案内", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByLabel("年", { exact: true }).fill("2026");
  await page.getByLabel("月", { exact: true }).selectOption("8");
  const day = page.getByRole("button", { name: "2026年8月12日", exact: false });
  await expect(day).toHaveAttribute("aria-pressed", "false");
  await day.click();
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".print-root article").nth(11).locator("tbody tr")).toHaveCount(21);
  await expect(page.locator(".print-root article").nth(12).locator("tbody tr")).toHaveCount(20);
  await expect(page.locator(".print-root article").nth(10).locator("tbody tr")).toHaveCount(21); // 山の日
  await page.locator(".preview-controls select").selectOption("12");
  await expect(page.locator(".preview-card .reservation-sheet tbody tr")).toHaveCount(21);
  await page.reload();
  await page.getByLabel("年", { exact: true }).fill("2026");
  await page.getByLabel("月", { exact: true }).selectOption("8");
  await expect(day).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printActive = String(navigator.userActivation.isActive);
      document.body.dataset.printPages = String(document.querySelectorAll(".print-root article").length);
    };
  });
  await page.getByRole("button", { name: "この月を印刷", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-print-active", "true");
  await expect(page.locator("body")).toHaveAttribute("data-print-pages", "31");
  await expect(page.getByRole("heading", { name: "印刷画面が開かないとき" })).toBeVisible();
  await expect(page.locator(".print-help")).toContainText("引き継がれない場合");
  await page.evaluate(() => { window.print = () => { throw new Error("not supported"); }; });
  await page.getByRole("button", { name: "この月を印刷", exact: true }).click();
  await expect(page.locator(".print-error")).toContainText("印刷を開始できません");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("screen.png"), fullPage: true });
  await page.getByRole("button", { name: "すべて解除" }).click();
  await expect(day).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".print-root article").nth(11).locator("tbody tr")).toHaveCount(20);
  expect(errors).toEqual([]);
});

for (const { year, month, days } of months) {
  test(`${year}-${month}: A4縦 ${days}ページ、空白・日付欠落なし`, async ({ page, browserName }, testInfo) => {
    await page.goto("/");
    await page.getByLabel("年", { exact: true }).fill(String(year));
    await page.getByLabel("月", { exact: true }).selectOption(String(month));
    await expect(page.locator(".print-root article")).toHaveCount(days);
    // Additional holiday must also fit without creating an extra page.
    const weekday = page.locator('.calendar-day[aria-pressed="false"]:not(:disabled)').first();
    await weekday.click();
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".app-shell")).toBeHidden();
    await expect(page.locator(".print-root")).toBeVisible();
    const layout = await page.locator(".print-root article").evaluateAll((sheets) => sheets.map((sheet) => {
      const style = getComputedStyle(sheet);
      return { width: sheet.getBoundingClientRect().width, height: sheet.getBoundingClientRect().height,
        after: style.breakAfter, rows: sheet.querySelectorAll("tbody tr").length };
    }));
    for (const sheet of layout) {
      expect(sheet.width).toBeCloseTo(210 * 96 / 25.4, 0);
      expect(sheet.height).toBeLessThanOrEqual(297 * 96 / 25.4);
      expect([20, 21]).toContain(sheet.rows);
    }
    expect(layout.at(-1)?.after).toBe("auto");
    expect(layout.slice(0, -1).every((sheet) => sheet.after === "page")).toBe(true);
    // Only Chromium exposes PDF generation. WebKit checks print CSS, not pagination.
    if (browserName !== "chromium") return;
    const buffer = await page.pdf({ path: testInfo.outputPath("month.pdf"), preferCSSPageSize: true, printBackground: true });
    const loadingTask = getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
    const pdf = await loadingTask.promise;
    try {
      expect(pdf.numPages).toBe(days);
      for (let day = 1; day <= days; day++) {
        const pdfPage = await pdf.getPage(day);
        const viewport = pdfPage.getViewport({ scale: 1 });
        expect(viewport.width).toBeCloseTo(595.28, 0);
        expect(viewport.height).toBeCloseTo(841.89, 0);
        const content = await pdfPage.getTextContent();
        const text = content.items.map((item) => "str" in item ? item.str : "").join("").normalize("NFKC");
        expect(text).toContain(`予約日:${year}年${month}月${day}日`);
        expect(text.match(/予約日:/g)).toHaveLength(1);
        expect(text.match(/電話\s*ネット/g)).toHaveLength(layout[day - 1].rows);
        expect(text).toContain("前日までに受け付けてください。");
        expect(text).not.toContain("印刷画面が開かないとき");
      }
    } finally {
      await loadingTask.destroy();
    }
  });
}
