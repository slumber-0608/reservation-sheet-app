import { getDayKind, getMonthDates, isHolidayKind } from "@/lib/date-utils";
import { ReservationSheet } from "./ReservationSheet";

type PrintAllSheetsProps = {
  year: number;
  month: number;
  customDays: number[];
};

export function PrintAllSheets({ year, month, customDays }: PrintAllSheetsProps) {
  const dates = getMonthDates(year, month);

  return (
    <div className="print-root" aria-hidden="true">
      {dates.map((date) => (
        <ReservationSheet
          key={date.day}
          date={date}
          holiday={isHolidayKind(getDayKind(date, customDays))}
          printClassName="print-sheet"
        />
      ))}
    </div>
  );
}

