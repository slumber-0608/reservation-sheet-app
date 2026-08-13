"use client";

import { useEffect, useRef, useState } from "react";
import { getDayKind, isHolidayKind, type CalendarDate } from "@/lib/date-utils";
import { ReservationSheet } from "./ReservationSheet";

type PrintPreviewProps = {
  year: number;
  month: number;
  daysInMonth: number;
  customDays: number[];
  selectedDay: number;
  onSelectedDayChange: (day: number) => void;
};

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;

export function PrintPreview({
  year,
  month,
  daysInMonth,
  customDays,
  selectedDay,
  onSelectedDayChange,
}: PrintPreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const date: CalendarDate = { year, month, day: selectedDay };
  const holiday = isHolidayKind(getDayKind(date, customDays));

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateScale = () => setScale(Math.min(1, Math.max(0.25, (viewport.clientWidth - 2) / A4_WIDTH_PX)));
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="card-heading preview-heading">
        <div>
          <p className="eyebrow">STEP 2</p>
          <h2 id="preview-title">予約表を確認</h2>
        </div>
        <div className="preview-controls" aria-label="プレビューする日を変更">
          <button
            type="button"
            className="small-button"
            disabled={selectedDay === 1}
            onClick={() => onSelectedDayChange(selectedDay - 1)}
          >
            前の日
          </button>
          <label>
            <span className="sr-only">プレビューする日</span>
            <select value={selectedDay} onChange={(event) => onSelectedDayChange(Number(event.target.value))}>
              {Array.from({ length: daysInMonth }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>{month}月{day}日</option>
              ))}
            </select>
          </label>
          <strong aria-live="polite">{selectedDay} / {daysInMonth}</strong>
          <button
            type="button"
            className="small-button"
            disabled={selectedDay === daysInMonth}
            onClick={() => onSelectedDayChange(selectedDay + 1)}
          >
            次の日
          </button>
        </div>
      </div>

      <div className="preview-viewport" ref={viewportRef}>
        <div className="preview-stage" style={{ height: `${A4_HEIGHT_PX * scale}px` }}>
          <div className="preview-scale" style={{ transform: `scale(${scale})` }}>
            <ReservationSheet date={date} holiday={holiday} />
          </div>
        </div>
      </div>
      <p className="preview-help">画面では縮小して表示しています。印刷時はA4縦の実寸になります。</p>
    </section>
  );
}

