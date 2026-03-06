import { useState, useRef, useEffect } from 'react';
import type { PairedHour } from '../../types';
import type { StatusColor } from '../../constants';
import { getSprayStatusForHour } from '../../sectionStatus/spray';
import { GridCellTooltip } from './GridCellTooltip';

const CELL_HEIGHT = 28;
const ROW_LABEL_WIDTH = 48;

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
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (data: typeof tooltip, x: number, y: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTooltip(data);
      setHoverPos({ x, y });
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
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ overflowX: 'hidden', width: '100%' }}>
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' }}>
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
                    style={{
                      width: ROW_LABEL_WIDTH,
                      height: CELL_HEIGHT,
                      paddingLeft: 4,
                      borderTop: isNowRow ? '1px solid rgba(37,40,48,0.2)' : undefined,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--text-tertiary)',
                      verticalAlign: 'middle',
                    }}
                  >
                    {hour % 3 === 0 ? formatHourLabel(hour) : ''}
                    {isNowRow && <span style={{ marginLeft: 4, fontSize: 9 }}>NOW</span>}
                  </td>
                  {dayLabels.map((_, d) => {
                    const cellIndex = getIndexForDayHour(paired, refMidnight, d, hour);
                    if (cellIndex < 0 || cellIndex >= paired.length) {
                      return (
                        <td
                          key={d}
                          style={{
                            height: CELL_HEIGHT,
                            backgroundColor: 'var(--surface2)',
                            border: '1px solid var(--border)',
                            textAlign: 'center',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 10,
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          —
                        </td>
                      );
                    }
                    const pair = paired[cellIndex];
                    const status = getSprayStatusForHour(paired, cellIndex);
                    const statusBg =
                      status === 'green'
                        ? 'rgba(34, 197, 94, 0.35)'
                        : status === 'amber'
                          ? 'rgba(245, 158, 11, 0.35)'
                          : status === 'red'
                            ? 'rgba(239, 68, 68, 0.35)'
                            : 'var(--surface2)';
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
                        style={{
                          height: CELL_HEIGHT,
                          minHeight: CELL_HEIGHT,
                          backgroundColor: statusBg,
                          border: '1px solid var(--border)',
                          padding: 0,
                          verticalAlign: 'middle',
                          cursor: 'default',
                        }}
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
          style={{
            position: 'fixed',
            left: hoverPos.x + 12,
            top: hoverPos.y + 12,
            zIndex: 1000,
            opacity: 1,
            transition: 'opacity 150ms ease',
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
