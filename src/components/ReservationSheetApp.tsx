"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatMonthKey,
  getCurrentJstYearMonth,
  getDayKind,
  getDaysInMonth,
  isHolidayKind,
} from "@/lib/date-utils";
import { Calendar } from "./Calendar";
import { MonthSelector } from "./MonthSelector";
import { PrintAllSheets } from "./PrintAllSheets";
import { PrintPreview } from "./PrintPreview";

const STORAGE_KEY = "reservation-sheet-app:custom-holidays:v1";

type CustomHolidayState = Record<string, number[]>;

export function ReservationSheetApp() {
  const initialMonth = useMemo(() => getCurrentJstYearMonth(), []);
  const [year, setYear] = useState(initialMonth.year);
  const [month, setMonth] = useState(initialMonth.month);
  const [selectedDay, setSelectedDay] = useState(1);
  const [customByMonth, setCustomByMonth] = useState<CustomHolidayState>({});
  const [storageReady, setStorageReady] = useState(false);

  const monthKey = formatMonthKey(year, month);
  const customDays = customByMonth[monthKey] ?? [];
  const daysInMonth = getDaysInMonth(year, month);

  useEffect(() => {
    let cancelled = false;
    let savedHolidays: CustomHolidayState = {};

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) savedHolidays = JSON.parse(saved) as CustomHolidayState;
    } catch {
      // The app remains usable when storage is blocked or contains invalid data.
    }

    queueMicrotask(() => {
      if (cancelled) return;
      setCustomByMonth(savedHolidays);
      setStorageReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customByMonth));
    } catch {
      // Printing and previewing must not depend on storage availability.
    }
  }, [customByMonth, storageReady]);

  const changeMonth = (nextYear: number, nextMonth: number) => {
    if (!Number.isFinite(nextYear) || nextYear < 1948 || nextYear > 2099) return;
    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDay(1);
  };

  const toggleDay = (day: number) => {
    const kind = getDayKind({ year, month, day }, customDays);
    if (isHolidayKind(kind) && kind !== "custom") return;

    setCustomByMonth((current) => {
      const currentDays = current[monthKey] ?? [];
      const nextDays = currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day].sort((a, b) => a - b);
      return { ...current, [monthKey]: nextDays };
    });
  };

  const clearCustomDays = () => {
    setCustomByMonth((current) => ({ ...current, [monthKey]: [] }));
  };

  const printMonth = () => {
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <>
      <div className="app-shell">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="予約表ジェネレーター ホーム">
            <span className="brand-mark" aria-hidden="true">予</span>
            <span>予約表ジェネレーター</span>
          </a>
          <span className="header-note">A4・1日1ページ</span>
        </header>

        <main id="top">
          <section className="hero">
            <p className="eyebrow">RESERVATION SHEET GENERATOR</p>
            <h1>紙の予約表を、<br />迷わず準備。</h1>
            <p className="hero-copy">年月を選び、休日を確認するだけ。ひと月分の予約表をA4でまとめて印刷できます。</p>
            <MonthSelector year={year} month={month} onChange={changeMonth} />
          </section>

          <div className="content-grid">
            <Calendar
              year={year}
              month={month}
              customDays={customDays}
              onToggleDay={toggleDay}
              onClear={clearCustomDays}
            />

            <PrintPreview
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              customDays={customDays}
              selectedDay={selectedDay}
              onSelectedDayChange={setSelectedDay}
            />

            <div className="print-card-slot">
              <aside className="print-card" aria-labelledby="print-title">
                <p className="eyebrow">STEP 3</p>
                <h2 id="print-title">この月を印刷</h2>
                <p><strong>{year}年{month}月</strong>の予約表を、日付順に<strong>{daysInMonth}ページ</strong>生成します。</p>
                <dl className="print-summary">
                  <div><dt>用紙</dt><dd>A4縦</dd></div>
                  <div><dt>ページ</dt><dd>1日1枚</dd></div>
                  <div><dt>追加休日</dt><dd>{customDays.length}日</dd></div>
                </dl>
                <button type="button" className="primary-button" onClick={printMonth}>
                  この月を印刷
                </button>
                <p className="print-hint">印刷画面では「ヘッダーとフッター」をオフ、倍率を100%にするときれいに収まります。</p>
              </aside>
            </div>
          </div>
        </main>

        <footer className="site-footer">
          <p>予約情報は保存しません。追加休日だけ、この端末のブラウザに保存されます。</p>
        </footer>
      </div>

      <PrintAllSheets year={year} month={month} customDays={customDays} />
    </>
  );
}
