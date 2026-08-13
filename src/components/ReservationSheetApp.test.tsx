import assert from "node:assert/strict";
import test from "node:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { JSDOM } from "jsdom";
import { ReservationSheetApp } from "./ReservationSheetApp";

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
    url: "http://localhost/",
  });

  Object.defineProperties(globalThis, {
    window: { value: dom.window, configurable: true },
    document: { value: dom.window.document, configurable: true },
    navigator: { value: dom.window.navigator, configurable: true },
    HTMLElement: { value: dom.window.HTMLElement, configurable: true },
    Event: { value: dom.window.Event, configurable: true },
    ResizeObserver: { value: TestResizeObserver, configurable: true },
    IS_REACT_ACT_ENVIRONMENT: { value: true, configurable: true },
  });

  dom.window.requestAnimationFrame = (callback) => dom.window.setTimeout(callback, 0);
  dom.window.print = () => {};
  return dom;
}

async function renderApp(container: HTMLElement): Promise<Root> {
  const root = createRoot(container);
  await act(async () => {
    root.render(<ReservationSheetApp />);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return root;
}

test("追加休日の切替が印刷DOMへ反映され、再マウント後もlocalStorageから復元される", async () => {
  const dom = installDom();
  const container = dom.window.document.querySelector<HTMLElement>("#root");
  assert.ok(container);

  let root = await renderApp(container);
  const day12 = Array.from(dom.window.document.querySelectorAll<HTMLButtonElement>(".calendar-day")).find((button) =>
    button.getAttribute("aria-label")?.startsWith("2026年8月12日"),
  );
  assert.ok(day12);
  assert.equal(day12.getAttribute("aria-pressed"), "false");

  await act(async () => {
    day12.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(day12.getAttribute("aria-pressed"), "true");
  assert.match(dom.window.document.querySelector(".custom-holiday-summary")?.textContent ?? "", /8月12日（水）/);
  assert.equal(dom.window.document.querySelectorAll(".print-root .reservation-sheet").length, 31);
  assert.match(
    dom.window.document.querySelectorAll(".print-root .reservation-sheet")[11]?.querySelector("h2")?.textContent ?? "",
    /土日祝/,
  );

  await act(async () => root.unmount());
  root = await renderApp(container);

  const restoredDay12 = Array.from(dom.window.document.querySelectorAll<HTMLButtonElement>(".calendar-day")).find((button) =>
    button.getAttribute("aria-label")?.startsWith("2026年8月12日"),
  );
  assert.ok(restoredDay12);
  assert.equal(restoredDay12.getAttribute("aria-pressed"), "true");

  await act(async () => {
    restoredDay12.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  assert.equal(restoredDay12.getAttribute("aria-pressed"), "false");

  await act(async () => root.unmount());
  dom.window.close();
});

