import { useState, useRef, useEffect } from 'react';
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

const RATING_CODE: Record<string, string> = {
  CLEAR: 'CLR',
  MARGINAL: 'MGN',
  HOLD: 'HLD',
};

export function TenDayRatingStrip({ paired, nowIndex }: TenDayRatingStripProps) {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const commitWindow = getCommitWindow(paired, nowIndex);
  const windowStartIndex = commitWindow.windowStartIndex ?? -1;
  const windowEndIndex = commitWindow.windowEndIndex ?? -1;

  const [tooltip, setTooltip] = useState<{
    dayName: string;
    dateStr: string;
    rating: string;
    botrytis: string;
    dryHours: string;
    rainProb: number;
    status: 'green' | 'amber' | 'red';
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = (
    data: NonNullable<typeof tooltip>,
    x: number,
    y: number
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTooltip(data);
      setTooltipPos({ x, y });
    }, 150);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTooltip(null);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const columns = [];
  for (let d = 0; d < 10; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const firstTime = paired[dayStart].weatherHour.time;
    const rating = getDayRating(paired, dayStart);
    const isInCommitWindow =
      commitWindow.state === 'WINDOW' &&
      windowStartIndex >= 0 &&
      windowEndIndex >= 0 &&
      dayStart >= windowStartIndex &&
      dayStart <= windowEndIndex;

    const dayName = new Date(firstTime).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dateStr = new Date(firstTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

    columns.push(
      <div
        key={d}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: isInCommitWindow ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          showTooltip(
            {
              dayName,
              dateStr,
              rating: rating.rating,
              botrytis: rating.botrytis,
              dryHours: rating.dryHours,
              rainProb: rating.rainProb,
              status: rating.status,
            },
            e.clientX,
            e.clientY
          );
        }}
        onMouseLeave={hideTooltip}
      >
        <div className="label-caps" style={{ marginBottom: 2 }}>{dayAbbrev(firstTime)}</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
          {new Date(firstTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div
          style={{
            width: '100%',
            minHeight: 48,
            backgroundColor: 'var(--surface2)',
            borderLeft: `4px solid ${
              rating.status === 'green' ? 'var(--green)' : rating.status === 'amber' ? 'var(--amber)' : 'var(--red)'
            }`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              color:
                rating.status === 'green'
                  ? 'var(--green)'
                  : rating.status === 'amber'
                    ? 'var(--amber)'
                    : 'var(--red)',
            }}
          >
            {RATING_CODE[rating.rating] ?? rating.rating}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ paddingTop: 16, flexShrink: 0 }}>
          <span className="label-caps" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
            TODAY
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ width: '100%', height: 1, backgroundColor: 'var(--border)', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {columns}
          </div>
        </div>
      </div>
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 12,
            top: tooltipPos.y + 12,
            zIndex: 1000,
            backgroundColor: 'var(--surface2)',
            border: '1px solid var(--border-active)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            minWidth: 160,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'opacity 150ms ease',
          }}
        >
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
            {tooltip.dayName} · {tooltip.dateStr}
          </div>
          <div style={{ height: 1, backgroundColor: 'var(--border)', marginBottom: 8 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span className="label-caps" style={{ fontSize: 10 }}>BOTRYTIS</span>
              <span
                className="value-mono"
                style={{
                  fontSize: 12,
                  color:
                    tooltip.botrytis === 'HIGH'
                      ? 'var(--red)'
                      : tooltip.botrytis === 'MODERATE'
                        ? 'var(--amber)'
                        : 'var(--text-primary)',
                }}
              >
                {tooltip.botrytis}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span className="label-caps" style={{ fontSize: 10 }}>DRY HRS</span>
              <span className="value-mono" style={{ fontSize: 12 }}>{tooltip.dryHours}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span className="label-caps" style={{ fontSize: 10 }}>RAIN PROB</span>
              <span className="value-mono" style={{ fontSize: 12 }}>{tooltip.rainProb}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
