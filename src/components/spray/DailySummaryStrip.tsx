import type { PairedHour } from '../../types';
import { getBestWindowForDay, formatDayDate } from '../../sprayLogic';

interface DailySummaryStripProps {
  paired: PairedHour[];
  nowIndex: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ROW_LABEL_WIDTH = 48;

function getDayLabel(iso: string): string {
  const d = new Date(iso);
  return DAY_NAMES[d.getDay()];
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
      <div
        key={d}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: '8px 12px',
        }}
      >
        <div className="label-caps" style={{ marginBottom: 2 }}>{getDayLabel(firstHour)}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          {formatDayDate(firstHour)}
        </div>
        {best ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
            Best: {best.start} – {best.end}
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--red)' }}>
            No window today
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        marginBottom: 24,
        overflowX: 'auto',
      }}
    >
      <div style={{ width: ROW_LABEL_WIDTH, flexShrink: 0 }} />
      <div
        style={{
          display: 'flex',
          flex: 1,
          minWidth: 0,
        }}
      >
        {cards}
      </div>
    </div>
  );
}
