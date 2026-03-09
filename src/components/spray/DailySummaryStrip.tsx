import type { PairedHour } from '../../types';
import { getBestWindowForDay, formatDayDate } from '../../sprayLogic';
import './DailySummaryStrip.css';

interface DailySummaryStripProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function DailySummaryStrip({ paired, nowIndex }: DailySummaryStripProps) {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const cards = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const firstHour = paired[dayStart].weatherHour.time;
    const best = getBestWindowForDay(paired, dayStart);
    cards.push(
      <div key={d} className="dailySummaryStrip__card">
        <div className="dailySummaryStrip__date">{formatDayDate(firstHour)}</div>
        {best ? (
          <div className="dailySummaryStrip__window">
            Best: {best.start} – {best.end}
          </div>
        ) : (
          <div className="dailySummaryStrip__noWindow">No window today</div>
        )}
      </div>
    );
  }

  return (
    <div className="dailySummaryStrip__wrap">
      <div className="dailySummaryStrip__spacer" />
      <div className="dailySummaryStrip__cards">
        {cards}
      </div>
    </div>
  );
}
