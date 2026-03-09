import type { PairedHour } from '../../types';
import { getDayRating, getCommitWindow } from '../../harvestLogic';
import './TenDayRatingStrip.css';

interface TenDayRatingStripProps {
  paired: PairedHour[];
  nowIndex: number;
}

const DAY_ABBREV = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function dayAbbrev(iso: string): string {
  return DAY_ABBREV[new Date(iso).getDay()];
}

export function TenDayRatingStrip({ paired, nowIndex }: TenDayRatingStripProps) {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const commitWindow = getCommitWindow(paired, nowIndex);
  const windowStartIndex = commitWindow.windowStartIndex ?? -1;
  const windowEndIndex = commitWindow.windowEndIndex ?? -1;

  const cards = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const firstTime = paired[dayStart].weatherHour.time;
    const rating = getDayRating(paired, dayStart);
    const isToday = d === 0;
    const isInCommitWindow =
      commitWindow.state === 'WINDOW' &&
      windowStartIndex >= 0 &&
      windowEndIndex >= 0 &&
      dayStart >= windowStartIndex &&
      dayStart <= windowEndIndex;

    const dateStr = new Date(firstTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    cards.push(
      <div
        key={d}
        className="tenDayRatingStrip__card"
        data-in-window={isInCommitWindow}
      >
        <div className="tenDayRatingStrip__cardHeader">
          <div className="tenDayRatingStrip__cardLeft">
            {isToday && <div className="tenDayRatingStrip__todayDot" />}
            <span className="tenDayRatingStrip__dayAbbrev">
              {dayAbbrev(firstTime)}
            </span>
          </div>
          <span
            className="value-mono tenDayRatingStrip__rating"
            data-status={rating.status}
          >
            {rating.rating}
          </span>
        </div>
        <div className="tenDayRatingStrip__date">{dateStr}</div>
        <div className="tenDayRatingStrip__details">
          <div>Botrytis  {rating.botrytis}</div>
          <div>Rain  {rating.rainProb}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tenDayRatingStrip__wrap">
      <div className="tenDayRatingStrip__scroll">
        {cards}
      </div>
    </div>
  );
}
