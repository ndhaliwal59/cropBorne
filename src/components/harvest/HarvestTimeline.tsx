import * as React from 'react';
import type { PairedHour } from '../../types';
import { getDayRating } from '../../harvestLogic';
import './HarvestTimeline.css';

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

  return (
    <div className="harvestTimeline__wrap">
      <div
        className="harvestTimeline__grid"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day, i) => (
          <div key={`name-${i}`} className="harvestTimeline__dayName">
            {DAY_ABBREV[new Date(day.time).getDay()]}
          </div>
        ))}
        {days.map((day, i) => (
          <div key={`date-${i}`} className="harvestTimeline__date">
            {new Date(day.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
          </div>
        ))}
        {days.map((day, i) => {
          const isGo = day.rating.rating === 'CLEAR';
          const status = day.rating.status;
          return (
            <div
              key={`circle-${i}`}
              ref={(el) => { columnRefs.current[i] = el; }}
              onMouseEnter={() => handleDayMouseEnter(i)}
              onMouseLeave={handleDayMouseLeave}
              className="harvestTimeline__circle"
              data-status={status}
              aria-label={day.rating.rating}
            >
              {isGo ? '●' : '○'}
            </div>
          );
        })}
        {days.map((day, i) => (
          <div
            key={`status-${i}`}
            className="harvestTimeline__statusLabel"
            data-status={day.rating.status}
          >
            {day.rating.rating}
          </div>
        ))}
      </div>

      {hoveredDay !== null && days[hoveredDay] && tooltipPos && (
        <div
          className="harvestTimeline__tooltip"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <div className="harvestTimeline__tooltipHeader">
            <span className="harvestTimeline__tooltipTitle">
              {days[hoveredDay].tooltip.dayName.toUpperCase()} · {days[hoveredDay].tooltip.dateStr}
            </span>
            <span
              className="value-mono harvestTimeline__tooltipRating"
              data-status={days[hoveredDay].rating.status}
            >
              {days[hoveredDay].rating.rating}
            </span>
          </div>
          <div className="harvestTimeline__tooltipDivider" />
          <div className="harvestTimeline__tooltipBody">
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
