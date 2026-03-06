import * as React from 'react';
import type { PairedHour } from '../../types';
import { getDayRating } from '../../harvestLogic';

interface HarvestTimelineProps {
  paired: PairedHour[];
  nowIndex: number;
}

const DAY_ABBREV = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDayTooltipData(paired: PairedHour[], dayStartIndex: number) {
  const rating = getDayRating(paired, dayStartIndex);
  const endIndex = Math.min(dayStartIndex + 23, paired.length - 1);
  const end = paired[endIndex];
  const dryStreak = end?.fieldState.dryStreakHours ?? 0;
  const soil = end?.fieldState.soilMoisture ?? 0;
  const time = paired[dayStartIndex]?.weatherHour.time ?? '';
  const dayName = DAY_NAMES[new Date(time).getDay()];
  const dateStr = new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  return { ...rating, dayName, dateStr, dryStreak, soil };
}

export function HarvestTimeline({ paired, nowIndex }: HarvestTimelineProps) {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const DAYS_TO_SHOW = 7;

  const days: { dayStart: number; time: string; rating: ReturnType<typeof getDayRating>; tooltip: ReturnType<typeof getDayTooltipData> }[] = [];
  for (let d = 0; d < DAYS_TO_SHOW; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const time = paired[dayStart].weatherHour.time;
    const rating = getDayRating(paired, dayStart);
    const tooltip = getDayTooltipData(paired, dayStart);
    days.push({ dayStart, time, rating, tooltip });
  }

  const blockingIndex = days.findIndex((d) => d.rating.rating !== 'CLEAR');
  const blockingDay = blockingIndex >= 0 ? days[blockingIndex] : null;

  const [hoveredDay, setHoveredDay] = React.useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const columnRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const handleDayMouseEnter = (dayIndex: number) => {
    setHoveredDay(dayIndex);
    const el = columnRefs.current[dayIndex];
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom });
    }
  };
  const handleDayMouseLeave = () => {
    setHoveredDay(null);
    setTooltipPos(null);
  };

  const ratingColor = (status: 'green' | 'amber' | 'red') =>
    status === 'green' ? 'var(--green)' : status === 'amber' ? 'var(--amber)' : 'var(--red)';

  function blockingReason(rating: ReturnType<typeof getDayRating>): string {
    if (rating.rating === 'CLEAR') return '';
    if (rating.rainProb > 0) return `Rain ${rating.rainProb}%`;
    return rating.rating;
  }

  return (
    <div style={{ position: 'relative', marginTop: 24 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          gap: 0,
          fontFamily: 'var(--font-sans)',
          textAlign: 'center',
          alignItems: 'end',
        }}
      >
        {/* Row 1: Day names */}
        {days.map((day, i) => (
          <div
            key={`name-${i}`}
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              marginBottom: 4,
            }}
          >
            {DAY_ABBREV[new Date(day.time).getDay()]}
          </div>
        ))}
        {/* Row 2: Dates */}
        {days.map((day, i) => (
          <div
            key={`date-${i}`}
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: 12,
            }}
          >
            {new Date(day.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        ))}
        {/* Row 3: Circles (go = filled, no-go = empty) in status color — hoverable */}
        {days.map((day, i) => {
          const isGo = day.rating.rating === 'CLEAR';
          const color = ratingColor(day.rating.status);
          const isHovered = hoveredDay === i;
          return (
            <div
              key={`circle-${i}`}
              ref={(el) => { columnRefs.current[i] = el; }}
              onMouseEnter={() => handleDayMouseEnter(i)}
              onMouseLeave={handleDayMouseLeave}
              style={{
                fontSize: 24,
                lineHeight: 1,
                marginBottom: 6,
                color,
                cursor: 'pointer',
                opacity: isHovered ? 1 : 0.85,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
              }}
              aria-label={day.rating.rating}
            >
              {isGo ? '●' : '○'}
            </div>
          );
        })}
        {/* Row 4: Status labels */}
        {days.map((day, i) => (
          <div
            key={`status-${i}`}
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              color: ratingColor(day.rating.status),
              marginBottom: 2,
            }}
          >
            {day.rating.rating}
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredDay !== null && days[hoveredDay] && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, 0) translateY(12px)',
            backgroundColor: 'var(--surface1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            pointerEvents: 'none',
            minWidth: 200,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {days[hoveredDay].tooltip.dayName.toUpperCase()} · {days[hoveredDay].tooltip.dateStr}
            </span>
            <span
              className="value-mono"
              style={{ fontSize: 12, fontWeight: 700, color: ratingColor(days[hoveredDay].rating.status) }}
            >
              {days[hoveredDay].rating.rating}
            </span>
          </div>
          <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '6px 0' }} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)' }}>
            <div>Botrytis &nbsp;&nbsp;&nbsp; {days[hoveredDay].tooltip.botrytis}</div>
            <div>Rain prob &nbsp; {days[hoveredDay].tooltip.rainProb}%</div>
            <div>Dry streak &nbsp; {days[hoveredDay].tooltip.dryStreak} hrs</div>
            <div>Soil &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {days[hoveredDay].tooltip.soil.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
