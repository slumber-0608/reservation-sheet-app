import { moveMonth } from "@/lib/date-utils";

type MonthSelectorProps = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const changeMonth = (offset: number) => {
    const next = moveMonth(year, month, offset);
    onChange(next.year, next.month);
  };

  return (
    <section className="month-selector" aria-label="年月を選択">
      <button type="button" className="icon-button" onClick={() => changeMonth(-1)} aria-label="前の月へ">
        <span aria-hidden="true">←</span>
      </button>

      <div className="month-fields">
        <label>
          <span className="sr-only">年</span>
          <input
            type="number"
            min={1948}
            max={2099}
            value={year}
            onChange={(event) => onChange(Number(event.target.value), month)}
            aria-label="年"
          />
          <span>年</span>
        </label>
        <label>
          <span className="sr-only">月</span>
          <select value={month} onChange={(event) => onChange(year, Number(event.target.value))} aria-label="月">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span>月</span>
        </label>
      </div>

      <button type="button" className="icon-button" onClick={() => changeMonth(1)} aria-label="次の月へ">
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

