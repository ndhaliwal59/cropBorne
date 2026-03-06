import type { PairedHour } from '../../types';
import { getDayRating, getCommitWindow } from '../../harvestLogic';

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

    const ratingColor =
      rating.status === 'green'
        ? 'var(--green)'
        : rating.status === 'amber'
          ? 'var(--amber)'
          : 'var(--red)';

    const dateStr = new Date(firstTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    cards.push(
      <div
        key={d}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--border)',
          ...(isInCommitWindow ? { borderTop: '2px solid var(--green)' } : {}),
          borderRadius: 'var(--radius-card)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {isToday && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              {dayAbbrev(firstTime)}
            </span>
          </div>
          <span
            className="value-mono"
            style={{ fontSize: 22, fontWeight: 700, color: ratingColor, flexShrink: 0 }}
          >
            {rating.rating}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          <div>Botrytis  {rating.botrytis}</div>
          <div>Rain  {rating.rainProb}%</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
        {cards}
      </div>
    </div>
  );
}
