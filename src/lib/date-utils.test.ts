import assert from "node:assert/strict";
import test from "node:test";
import {
  getDayKind,
  getDaysInMonth,
  getMonthDates,
  getWeekdayIndex,
  isJapaneseHoliday,
  moveMonth,
} from "./date-utils";

test("28日・29日・30日・31日の月を正しく判定する", () => {
  assert.equal(getDaysInMonth(2026, 2), 28);
  assert.equal(getDaysInMonth(2024, 2), 29);
  assert.equal(getDaysInMonth(2026, 4), 30);
  assert.equal(getDaysInMonth(2026, 8), 31);
});

test("月初・月末の曜日と月の日付一覧が正しい", () => {
  assert.equal(getWeekdayIndex({ year: 2026, month: 8, day: 1 }), 6);
  assert.equal(getWeekdayIndex({ year: 2026, month: 8, day: 31 }), 1);
  assert.equal(getMonthDates(2026, 8).length, 31);
});

test("土日、日本の祝日、平日を判定する", () => {
  assert.equal(getDayKind({ year: 2026, month: 8, day: 1 }, []), "saturday");
  assert.equal(getDayKind({ year: 2026, month: 8, day: 2 }, []), "sunday");
  assert.equal(isJapaneseHoliday({ year: 2026, month: 8, day: 11 }), true);
  assert.equal(getDayKind({ year: 2026, month: 8, day: 11 }, []), "holiday");
  assert.equal(getDayKind({ year: 2026, month: 8, day: 12 }, []), "weekday");
});

test("追加休日は平日だけを切り替え、元々の休日とは区別する", () => {
  assert.equal(getDayKind({ year: 2026, month: 8, day: 12 }, [12]), "custom");
  assert.equal(getDayKind({ year: 2026, month: 8, day: 11 }, [11]), "holiday");
});

test("年をまたぐ月移動が正しい", () => {
  assert.deepEqual(moveMonth(2026, 12, 1), { year: 2027, month: 1 });
  assert.deepEqual(moveMonth(2026, 1, -1), { year: 2025, month: 12 });
});

