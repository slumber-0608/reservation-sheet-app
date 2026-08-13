import { formatJapaneseDate, type CalendarDate } from "@/lib/date-utils";

type ReservationSheetProps = {
  date: CalendarDate;
  holiday: boolean;
  printClassName?: string;
};

const NOTES = [
  "土日祝日のご予約可能時間は、11:00および15:00〜16:30です。",
  "平日のご予約可能時間は、11:00〜11:30および15:00〜17:30です。",
  "同一時間帯にご予約が集中しないよう、受付件数にご注意ください（上限件数は別途協議のうえ決定します）。",
  "料金についてお問い合わせを受けた際は、ディナー料金、土日祝日料金および税込・税別の表記をご確認のうえご案内ください。",
  "店舗限定宴会コースおよび学生限定コースのご予約は、前日までに受け付けてください。",
];

const COLUMNS = [
  "来店確認",
  "ご予約方法",
  "ご予約時間",
  "人数",
  "お名前（カタカナ）",
  "受付者名前",
  "電話番号",
  "その他・特記",
];

function buildRows(holiday: boolean) {
  const groups = holiday
    ? [
        { label: "11:", count: 7 },
        { label: "15:", count: 7 },
        { label: "16:", count: 7 },
      ]
    : [
        { label: "11:", count: 5 },
        { label: "15:", count: 5 },
        { label: "16:", count: 5 },
        { label: "17:", count: 5 },
      ];

  return groups.flatMap((group, groupIndex) =>
    Array.from({ length: group.count }, (_, rowIndex) => ({
      time: group.label,
      groupStart: groupIndex > 0 && rowIndex === 0,
    })),
  );
}

export function ReservationSheet({ date, holiday, printClassName = "" }: ReservationSheetProps) {
  const rows = buildRows(holiday);
  const variant = holiday ? "holiday-sheet" : "weekday-sheet";

  return (
    <article className={`reservation-sheet ${variant} ${printClassName}`.trim()} aria-label={formatJapaneseDate(date)}>
      <header className="sheet-header">
        <h2>予約表（{holiday ? "土日祝" : "平日"}）</h2>
        <p className={holiday ? "holiday-date" : ""}>予約日：{formatJapaneseDate(date)}</p>
      </header>

      <table className="sheet-table">
        <colgroup>
          <col className="col-check" />
          <col className="col-method" />
          <col className="col-time" />
          <col className="col-people" />
          <col className="col-name" />
          <col className="col-staff" />
          <col className="col-phone" />
          <col className="col-note" />
        </colgroup>
        <thead>
          <tr>{COLUMNS.map((column) => <th scope="col" key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className={row.groupStart ? "group-start" : ""} key={`${row.time}-${index}`}>
              <td aria-label="来店確認" />
              <td className="method-cell">電話　ネット</td>
              <td className="time-cell"><strong>{row.time}</strong></td>
              <td aria-label="人数" />
              <td className="name-cell"><span>様</span></td>
              <td aria-label="受付者名前" />
              <td aria-label="電話番号" />
              <td aria-label="その他・特記" />
            </tr>
          ))}
        </tbody>
      </table>

      <section className="sheet-notes" aria-label="注意事項">
        <h3>注意事項</h3>
        <ul>
          {NOTES.map((note, index) => (
            <li className={index < 2 ? "important-note" : ""} key={note}>{note}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

