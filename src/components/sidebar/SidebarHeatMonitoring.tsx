import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PairedHour } from '../../types';
import { getHeatDayInfo, type HeatDayInfo } from '../../heatLogic';

type HeatComplianceState = 'all_clear' | 'heat_provisions' | 'high_heat';

interface SidebarHeatMonitoringProps {
  paired: PairedHour[];
  nowIndex: number;
  /** When true, render only the row (no section wrapper or title) for use under a shared MONITORING header */
  embedded?: boolean;
}

function getComplianceState(paired: PairedHour[], nowIndex: number): { state: HeatComplianceState; flaggedDays: HeatDayInfo[] } {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const flaggedDays: HeatDayInfo[] = [];
  let state: HeatComplianceState = 'all_clear';

  for (let d = 0; d < 7; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const info = getHeatDayInfo(paired, dayStart, d === 0);
    if (info.badge === 'HIGH-HEAT PROTOCOL ACTIVE') {
      state = 'high_heat';
      flaggedDays.push(info);
    } else if (info.badge === 'HEAT PROVISIONS REQUIRED') {
      if (state !== 'high_heat') state = 'heat_provisions';
      flaggedDays.push(info);
    }
  }

  return { state, flaggedDays };
}

function TooltipContent({ state, flaggedDays }: { state: HeatComplianceState; flaggedDays: HeatDayInfo[] }) {
  if (state === 'all_clear') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
                  &#x26A0; HEAT COMPLIANCE
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          No heat events in 7-day forecast.
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
          All shifts standard.
        </p>
      </div>
    );
  }

  const pillLabel = (info: HeatDayInfo) =>
    info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' ? 'HIGH-HEAT PROTOCOL' : 'HEAT PROVISIONS';
  const dateLine = (info: HeatDayInfo) =>
    `${info.dayLabel} ${info.dateLabel.toUpperCase()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        &#x26A0; HEAT COMPLIANCE
      </div>
      {flaggedDays.map((info) => (
        <div key={`${info.dayLabel}-${info.dateLabel}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              color: info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' ? 'var(--red)' : 'var(--amber)',
            }}
          >
            ⚑ {dateLine(info)} — {pillLabel(info)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              paddingLeft: 4,
            }}
          >
            Start {info.startTime}
            {info.badge === 'HEAT PROVISIONS REQUIRED' && (
              <> · Shade & water from {info.crosses80Time ?? '—'}</>
            )}
            {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && (
              <> · Breaks from 10AM</>
            )}
          </div>
          {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && info.compliantHours != null && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: 'var(--text-tertiary)',
                paddingLeft: 4,
              }}
            >
              Compliant hours: {info.compliantHours}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SidebarHeatMonitoring({ paired, nowIndex, embedded = false }: SidebarHeatMonitoringProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number } | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { state, flaggedDays } = getComplianceState(paired, nowIndex);
  const isAllClear = state === 'all_clear';
  const isHeatProvisions = state === 'heat_provisions';
  const isHighHeat = state === 'high_heat';

  const pillText =
    isHighHeat ? 'HIGH-HEAT PROTOCOL' : isHeatProvisions ? 'HEAT PROVISIONS' : 'ALL CLEAR';

  const setHoveredWithDelay = (value: boolean) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (!value) {
      leaveTimeoutRef.current = setTimeout(() => setHovered(false), 100);
    } else {
      setHovered(true);
    }
  };

  useEffect(() => {
    if (!hovered || !rowRef.current) {
      setTooltipRect(null);
      return;
    }
    const sidebarWidth =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim()
      ) || 240;
    const rect = rowRef.current.getBoundingClientRect();
    const gap = -20;
    const estimatedTooltipHeight = 220;
    let top = rect.top;
    if (top + estimatedTooltipHeight > window.innerHeight - gap) {
      top = window.innerHeight - estimatedTooltipHeight - gap;
    }
    if (top < gap) {
      top = gap;
    }
    setTooltipRect({
      top,
      left: sidebarWidth + 8,
    });
  }, [hovered]);

  const iconColor = isAllClear
    ? 'var(--text-tertiary)'
    : isHighHeat
      ? 'var(--red)'
      : 'var(--amber)';

  const pillBg =
    isAllClear
      ? 'var(--surface2)'
      : isHighHeat
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(245, 158, 11, 0.2)';
  const pillColor = isAllClear
    ? 'var(--text-tertiary)'
    : isHighHeat
      ? 'var(--red)'
      : 'var(--amber)';

  return (
    <>
      {embedded ? (
        <>
          <div
            ref={rowRef}
            onMouseEnter={() => setHoveredWithDelay(true)}
            onMouseLeave={() => setHoveredWithDelay(false)}
            role="button"
            tabIndex={0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 0',
              cursor: 'default',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 120ms ease',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setHoveredWithDelay(!hovered);
              }
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flex: 1,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: isAllClear ? 0.4 : 1,
                  color: iconColor,
                  boxShadow:
                    isHeatProvisions
                      ? '0 0 8px rgba(245, 158, 11, 0.4)'
                      : isHighHeat
                        ? '0 0 8px rgba(239, 68, 68, 0.4)'
                        : 'none',
                  animation: isHighHeat ? 'disease-icon-pulse 1.5s ease-in-out infinite' : undefined,
                  borderRadius: 2,
                }}
              >
                &#x26A0;
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: isAllClear ? 'var(--text-tertiary)' : 'var(--text-primary)',
                }}
              >
                HEAT
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 10,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: pillColor,
                backgroundColor: pillBg,
                padding: '4px 8px',
                borderRadius: 999,
                flexShrink: 0,
              }}
            >
              {pillText}
            </span>
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div
            className="label-caps"
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
              marginBottom: 8,
            }}
          >
            HEAT COMPLIANCE
          </div>
          <div
            ref={rowRef}
          onMouseEnter={() => setHoveredWithDelay(true)}
          onMouseLeave={() => setHoveredWithDelay(false)}
          role="button"
          tabIndex={0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 0',
            cursor: 'default',
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color 120ms ease',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setHoveredWithDelay(!hovered);
            }
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 16,
                lineHeight: 1,
                opacity: isAllClear ? 0.4 : 1,
                color: iconColor,
                boxShadow:
                  isHeatProvisions
                    ? '0 0 8px rgba(245, 158, 11, 0.4)'
                    : isHighHeat
                      ? '0 0 8px rgba(239, 68, 68, 0.4)'
                      : 'none',
                animation: isHighHeat ? 'disease-icon-pulse 1.5s ease-in-out infinite' : undefined,
                borderRadius: 2,
              }}
            >
              &#x26A0;
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: isAllClear ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}
            >
              HEAT & LABOUR
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: pillColor,
              backgroundColor: pillBg,
              padding: '4px 8px',
              borderRadius: 999,
              flexShrink: 0,
            }}
          >
            {pillText}
          </span>
        </div>
        </div>
      )}

      {hovered && tooltipRect &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipRect.top,
              left: tooltipRect.left,
              width: 260,
              padding: 16,
              backgroundColor: 'var(--surface2)',
              border: '1px solid var(--border-active)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              animation: 'tooltip-fade-in 150ms ease-out',
            }}
            onMouseEnter={() => setHoveredWithDelay(true)}
            onMouseLeave={() => setHoveredWithDelay(false)}
          >
            <TooltipContent state={state} flaggedDays={flaggedDays} />
          </div>,
          document.body
        )}
    </>
  );
}
