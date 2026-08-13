import * as holidayJp from "@holiday-jp/holiday_jp";

export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;
export const CALENDAR_WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type DayKind = "weekday" | "saturday" | "sunday" | "holiday" | "custom";

export function createCalendarDate({ year, month, day }: CalendarDate): Date {
  // Noon avoids date rollover around timezone and daylight-saving boundaries.
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function getCurrentJstYearMonth(): Pick<CalendarDate, "year" | "month"> {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0, 12, 0, 0, 0).getDate();
}

export function getMonthDates(year: number, month: number): CalendarDate[] {
  return Array.from({ length: getDaysInMonth(year, month) }, (_, index) => ({
    year,
    month,
    day: index + 1,
  }));
}

export function getWeekdayIndex(date: CalendarDate): number {
  return createCalendarDate(date).getDay();
}

export function isJapaneseHoliday(date: CalendarDate): boolean {
  return holidayJp.isHoliday(createCalendarDate(date));
}

export function getDayKind(date: CalendarDate, customDays: readonly number[]): DayKind {
  const weekday = getWeekdayIndex(date);

  if (isJapaneseHoliday(date)) return "holiday";
  if (weekday === 6) return "saturday";
  if (weekday === 0) return "sunday";
  if (customDays.includes(date.day)) return "custom";
  return "weekday";
}

export function isHolidayKind(kind: DayKind): boolean {
  return kind !== "weekday";
}

export function formatMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function formatJapaneseDate(date: CalendarDate): string {
  return `${date.year}年${date.month}月${date.day}日（${WEEKDAY_LABELS[getWeekdayIndex(date)]}）`;
}

export function moveMonth(year: number, month: number, offset: number): Pick<CalendarDate, "year" | "month"> {
  const moved = new Date(year, month - 1 + offset, 1, 12, 0, 0, 0);
  return { year: moved.getFullYear(), month: moved.getMonth() + 1 };
}

