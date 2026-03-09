import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { PairedHour } from '../../types';
import { getHeatDayInfo, type HeatDayInfo } from '../../heatLogic';
import './SidebarHeatMonitoring.css';

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
      <div className="sidebarHeatMonitoring__tooltipCol">
        <div className="sidebarHeatMonitoring__tooltipTitle">
          &#x26A0; HEAT COMPLIANCE
        </div>
        <p className="sidebarHeatMonitoring__tooltipPara">No heat events in 7-day forecast.</p>
        <p className="sidebarHeatMonitoring__tooltipPara">All shifts standard.</p>
      </div>
    );
  }

  const pillLabel = (info: HeatDayInfo) =>
    info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' ? 'HIGH-HEAT PROTOCOL' : 'HEAT PROVISIONS';
  const dateLine = (info: HeatDayInfo) =>
    `${info.dayLabel} ${info.dateLabel.toUpperCase()}`;

  return (
    <div className="sidebarHeatMonitoring__tooltipCol" style={{ gap: 12 }}>
      <div className="sidebarHeatMonitoring__tooltipTitle">
        &#x26A0; HEAT COMPLIANCE
      </div>
      {flaggedDays.map((info) => (
        <div key={`${info.dayLabel}-${info.dateLabel}`} className="sidebarHeatMonitoring__tooltipColNarrow">
          <div
            className="sidebarHeatMonitoring__tooltipDayTitle"
            data-badge={info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' ? 'high_heat' : 'heat_provisions'}
          >
            ⚑ {dateLine(info)} — {pillLabel(info)}
          </div>
          <div className="sidebarHeatMonitoring__tooltipSub">
            {info.badge === 'HEAT PROVISIONS REQUIRED' && (
              <>Shade & water {info.crosses80Time ?? '—'} – {info.dropsBelow80Time ?? '—'}</>
            )}
            {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && (
              <>Breaks from 10AM</>
            )}
          </div>
          {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && info.compliantHours != null && (
            <div className="sidebarHeatMonitoring__tooltipTertiary">
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

  const row = (
    <div
      ref={rowRef}
      onMouseEnter={() => setHoveredWithDelay(true)}
      onMouseLeave={() => setHoveredWithDelay(false)}
      role="button"
      tabIndex={0}
      className="sidebarHeatMonitoring__row"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setHoveredWithDelay(!hovered);
        }
      }}
    >
      <div className="sidebarHeatMonitoring__rowInner">
        <span
          className="sidebarHeatMonitoring__icon"
          data-state={state}
          aria-hidden
        >
          &#x26A0;
        </span>
        <span
          className="sidebarHeatMonitoring__title"
          data-state={state}
        >
          {embedded ? 'HEAT' : 'LABOUR'}
        </span>
      </div>
      <span
        className="sidebarHeatMonitoring__pill"
        data-state={state}
      >
        {pillText}
      </span>
    </div>
  );

  return (
    <>
      {embedded ? (
        row
      ) : (
        <div className="sidebarHeatMonitoring__section">
          <div className="label-caps sidebarHeatMonitoring__label">
            HEAT COMPLIANCE
          </div>
          {row}
        </div>
      )}

      {hovered && tooltipRect &&
        createPortal(
          <div
            className="sidebarHeatMonitoring__tooltip"
            style={{
              top: tooltipRect.top,
              left: tooltipRect.left,
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
