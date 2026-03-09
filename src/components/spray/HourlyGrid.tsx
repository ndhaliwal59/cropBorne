import { useState, useRef, useEffect } from 'react';
import type { PairedHour } from '../../types';
import type { StatusColor } from '../../constants';
import { getSprayStatusForHour } from '../../sectionStatus/spray';
import { GridCellTooltip } from './GridCellTooltip';
import './HourlyGrid.css';

const ROW_LABEL_WIDTH = 48;
const TOOLTIP_WIDTH = 240;
const TOOLTIP_OFFSET = 12;
const CELL_HEIGHT = 28;

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12am';
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return '12pm';
  return `${hour - 12}pm`;
}

interface HourlyGridProps {
  paired: PairedHour[];
  nowIndex: number;
}

/** Find paired index for a given day offset (0 = today) and hour (0-23). Uses calendar alignment so row 0 = midnight. */
function getIndexForDayHour(
  paired: PairedHour[],
  refMidnight: Date,
  dayOffset: number,
  hour: number
): number {
  const target = new Date(refMidnight);
  target.setDate(target.getDate() + dayOffset);
  target.setHours(hour, 0, 0, 0);
  const targetTime = target.getTime();
  for (let i = 0; i < paired.length; i++) {
    const t = new Date(paired[i].weatherHour.time).getTime();
    if (t === targetTime) return i;
    if (t > targetTime) return -1;
  }
  return -1;
}

export function HourlyGrid({ paired, nowIndex }: HourlyGridProps) {
  const [tooltip, setTooltip] = useState<{
    dayLabel: string;
    timeLabel: string;
    status: StatusColor | null;
    weather: import('../../types').WeatherHour;
    fieldState: import('../../types').FieldState;
  } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; placeAbove: boolean; placeLeft: boolean } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (data: typeof tooltip, x: number, y: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTooltip(data);
      const placeAbove = y > window.innerHeight / 2;
      const placeLeft = x > window.innerWidth - TOOLTIP_WIDTH - TOOLTIP_OFFSET - 16;
      setHoverPos({
        x,
        y,
        placeAbove,
        placeLeft,
      });
    }, 150);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTooltip(null);
    setHoverPos(null);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const nowDate = paired[nowIndex] ? new Date(paired[nowIndex].weatherHour.time) : new Date();
  const nowHour = nowDate.getHours();
  const refMidnight = new Date(nowDate);
  refMidnight.setHours(0, 0, 0, 0);
  const dayLabels: string[] = [];
  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(refMidnight);
    dayDate.setDate(dayDate.getDate() + d);
    dayLabels.push(dayDate.toLocaleDateString('en-US', { weekday: 'short' }));
  }

  return (
    <div className="hourlyGrid__wrap">
      <div className="hourlyGrid__overflow">
        <table className="hourlyGrid__table">
          <colgroup>
            <col style={{ width: '48px' }} />
            {dayLabels.map((_, i) => (
              <col key={i} style={{ width: 'calc((100% - 48px) / 7)' }} />
            ))}
          </colgroup>
          <tbody>
            {Array.from({ length: 24 }, (_, hour) => {
              const isNowRow = hour === nowHour;
              return (
                <tr key={hour}>
                  <td
                    className={`hourlyGrid__rowLabel ${isNowRow ? 'hourlyGrid__rowLabelNow' : ''}`}
                    style={{ width: ROW_LABEL_WIDTH, height: CELL_HEIGHT }}
                  >
                    {hour % 3 === 0 ? formatHourLabel(hour) : ''}
                    {isNowRow && <span className="hourlyGrid__nowBadge">NOW</span>}
                  </td>
                  {dayLabels.map((_, d) => {
                    const cellIndex = getIndexForDayHour(paired, refMidnight, d, hour);
                    if (cellIndex < 0 || cellIndex >= paired.length) {
                      return (
                        <td key={d} className="hourlyGrid__cellEmpty" style={{ height: CELL_HEIGHT }}>
                          —
                        </td>
                      );
                    }

                    const isPastCurrentDayCell = d === 0 && cellIndex < nowIndex;
                    if (isPastCurrentDayCell) {
                      return (
                        <td key={d} className="hourlyGrid__cellPast" style={{ height: CELL_HEIGHT }}>
                          -
                        </td>
                      );
                    }

                    const pair = paired[cellIndex];
                    const status = getSprayStatusForHour(paired, cellIndex);
                    const dayLabel = new Date(pair.weatherHour.time).toLocaleDateString('en-US', { weekday: 'long' });
                    const timeLabel = (() => {
                      const h = new Date(pair.weatherHour.time).getHours();
                      const m = new Date(pair.weatherHour.time).getMinutes();
                      const am = h < 12;
                      const h12 = h % 12 || 12;
                      return `${h12}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
                    })();
                    return (
                      <td
                        key={d}
                        className="hourlyGrid__cell"
                        data-status={status ?? 'none'}
                        style={{ height: CELL_HEIGHT }}
                        onMouseEnter={(e) => {
                          showTooltip(
                            {
                              dayLabel,
                              timeLabel,
                              status,
                              weather: pair.weatherHour,
                              fieldState: pair.fieldState,
                            },
                            e.clientX,
                            e.clientY
                          );
                        }}
                        onMouseLeave={hideTooltip}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tooltip && hoverPos && (
        <div
          className="hourlyGrid__tooltipWrapper"
          style={{
            left: hoverPos.placeLeft ? 'auto' : hoverPos.x + TOOLTIP_OFFSET,
            right: hoverPos.placeLeft ? window.innerWidth - hoverPos.x + TOOLTIP_OFFSET : 'auto',
            top: hoverPos.placeAbove ? 'auto' : hoverPos.y + TOOLTIP_OFFSET,
            bottom: hoverPos.placeAbove ? window.innerHeight - hoverPos.y + TOOLTIP_OFFSET : 'auto',
          }}
        >
          <GridCellTooltip
            dayLabel={tooltip.dayLabel}
            timeLabel={tooltip.timeLabel}
            status={tooltip.status}
            weather={tooltip.weather}
            fieldState={tooltip.fieldState}
          />
        </div>
      )}
    </div>
  );
}
