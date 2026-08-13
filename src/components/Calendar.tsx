import {
  CALENDAR_WEEKDAY_LABELS,
  formatJapaneseDate,
  getDayKind,
  getMonthDates,
  getWeekdayIndex,
  type DayKind,
} from "@/lib/date-utils";

type CalendarProps = {
  year: number;
  month: number;
  customDays: number[];
  onToggleDay: (day: number) => void;
  onClear: () => void;
};

const KIND_LABELS: Record<DayKind, string> = {
  weekday: "平日",
  saturday: "土曜",
  sunday: "日曜",
  holiday: "祝日",
  custom: "追加休日",
};

export function Calendar({ year, month, customDays, onToggleDay, onClear }: CalendarProps) {
  const dates = getMonthDates(year, month);
  const leadingBlanks = (getWeekdayIndex(dates[0]) + 6) % 7;

  return (
    <section className="calendar-card" aria-labelledby="calendar-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">STEP 1</p>
          <h2 id="calendar-title">休日を確認</h2>
        </div>
        <p>平日を押すと「休日扱い」に切り替わります</p>
      </div>

      <div className="calendar-legend" aria-label="カレンダーの凡例">
        <span><i className="legend-dot weekday" />平日</span>
        <span><i className="legend-dot weekend" />土日・祝日</span>
        <span><i className="legend-dot custom" />追加休日</span>
      </div>

      <div className="calendar-grid" role="grid" aria-label={`${year}年${month}月のカレンダー`}>
        {CALENDAR_WEEKDAY_LABELS.map((label, index) => (
          <div className={`weekday-heading weekday-heading-${index}`} role="columnheader" key={label}>
            {label}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, index) => (
          <div className="calendar-blank" key={`blank-${index}`} aria-hidden="true" />
        ))}
        {dates.map((date) => {
          const kind = getDayKind(date, customDays);
          const isNativeHoliday = kind === "saturday" || kind === "sunday" || kind === "holiday";
          const label = KIND_LABELS[kind];

          return (
            <button
              type="button"
              className={`calendar-day ${kind}`}
              key={date.day}
              onClick={() => onToggleDay(date.day)}
              disabled={isNativeHoliday}
              aria-pressed={kind === "custom"}
              aria-label={`${formatJapaneseDate(date)} ${label}${isNativeHoliday ? "（変更できません）" : "、押して切り替え"}`}
              title={isNativeHoliday ? `${label}のため休日扱いです` : "押して休日扱いを切り替え"}
            >
              <span className="day-number">{date.day}</span>
              <span className="day-status">{label}</span>
            </button>
          );
        })}
      </div>

      <div className="custom-holiday-summary" aria-live="polite">
        <div>
          <h3>休日扱いに変更した日</h3>
          {customDays.length ? (
            <p>
              {customDays
                .slice()
                .sort((a, b) => a - b)
                .map((day) => formatJapaneseDate({ year, month, day }).replace(`${year}年`, ""))
                .join("　")}
            </p>
          ) : (
            <p className="muted">まだありません</p>
          )}
        </div>
        {customDays.length > 0 && (
          <button type="button" className="text-button" onClick={onClear}>
            すべて解除
          </button>
        )}
      </div>
    </section>
  );
}

