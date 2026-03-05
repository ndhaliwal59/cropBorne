import { useState, useRef } from 'react';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import type { HeatDayInfo } from '../../heatLogic';

interface HeatDayCardProps {
  info: HeatDayInfo;
}

export function HeatDayCard({ info }: HeatDayCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tempColor =
    info.status === 'red'
      ? 'var(--red)'
      : info.status === 'amber'
        ? 'var(--amber)'
        : 'var(--text-primary)';

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const hasDetail =
    info.badge !== 'STANDARD' ||
    info.trafficabilityWarning;

  return (
    <>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: 'var(--surface1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          cursor: hasDetail ? 'default' : undefined,
        }}
        onMouseEnter={hasDetail ? handleMouseEnter : undefined}
        onMouseLeave={hasDetail ? handleMouseLeave : undefined}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            {info.isToday && (
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
              {info.dayLabel}
            </span>
          </div>
          <span
            className="value-mono"
            style={{ fontSize: 22, fontWeight: 700, color: tempColor, flexShrink: 0 }}
          >
            {Math.round(info.maxTempF)}°F
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
          {info.dateLabel}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            fontWeight: 700,
            color:
              info.badge === 'HIGH-HEAT PROTOCOL ACTIVE'
                ? 'var(--red)'
                : info.badge === 'HEAT PROVISIONS REQUIRED'
                  ? 'var(--amber)'
                  : 'var(--text-tertiary)',
          }}
        >
          {info.badge}
        </div>
      </div>
      {showTooltip && hasDetail && (
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
            minWidth: 200,
            maxWidth: 260,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'opacity 150ms ease',
          }}
        >
          {info.badge === 'STANDARD' && info.trafficabilityWarning && (
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--amber)' }}>
              ⚠ Soil saturation elevated — confirm row trafficability before dispatch.
            </span>
          )}
          {info.badge === 'HEAT PROVISIONS REQUIRED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <LabeledDataRow label="Start" value={info.startTime} />
              {info.crosses80Time && (
                <LabeledDataRow label="Crosses 80°F" value={info.crosses80Time} />
              )}
              {info.dropsBelow80Time && (
                <LabeledDataRow label="Drops below 80°F" value={info.dropsBelow80Time} />
              )}
              {info.flagLine && (
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--amber)',
                  }}
                >
                  ⚑ {info.flagLine}
                </div>
              )}
            </div>
          )}
          {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <LabeledDataRow label="Start" value={info.startTime} />
              {info.crosses95Time && (
                <LabeledDataRow label="Crosses 95°F" value={info.crosses95Time} />
              )}
              {info.breakCadence && (
                <LabeledDataRow label="Break cadence" value={info.breakCadence} />
              )}
              {info.compliantHours != null && (
                <LabeledDataRow label="Compliant hours" value={`${info.compliantHours} hrs`} />
              )}
              {info.flagLine && (
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--red)',
                  }}
                >
                  ⚑ {info.flagLine}
                </div>
              )}
            </div>
          )}
          {info.trafficabilityWarning && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--amber)' }}>
                ⚠ Soil saturation elevated — confirm row trafficability before dispatch.
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
