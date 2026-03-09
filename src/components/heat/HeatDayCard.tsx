import { useState, useRef } from 'react';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import type { HeatDayInfo } from '../../heatLogic';
import './HeatDayCard.css';

interface HeatDayCardProps {
  info: HeatDayInfo;
}

export function HeatDayCard({ info }: HeatDayCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const badgeKey =
    info.badge === 'HIGH-HEAT PROTOCOL ACTIVE'
      ? 'high_heat'
      : info.badge === 'HEAT PROVISIONS REQUIRED'
        ? 'heat_provisions'
        : 'standard';
  const statusKey = info.status === 'red' ? 'red' : info.status === 'amber' ? 'amber' : 'standard';

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
        className="heatDayCard__card"
        data-has-detail={hasDetail}
        onMouseEnter={hasDetail ? handleMouseEnter : undefined}
        onMouseLeave={hasDetail ? handleMouseLeave : undefined}
      >
        <div className="heatDayCard__header">
          <div className="heatDayCard__left">
            {info.isToday && <div className="heatDayCard__todayDot" />}
            <span className="heatDayCard__dayLabel">{info.dayLabel}</span>
          </div>
          <span
            className="value-mono heatDayCard__temp"
            data-status={statusKey}
          >
            {Math.round(info.maxTempF)}°F
          </span>
        </div>
        <div className="heatDayCard__date">{info.dateLabel}</div>
        <div className="heatDayCard__badge" data-badge={badgeKey}>
          {info.badge}
        </div>
      </div>
      {showTooltip && hasDetail && (
        <div
          className="heatDayCard__tooltip"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
        >
          {info.badge === 'STANDARD' && info.trafficabilityWarning && (
            <span className="heatDayCard__tooltipNote">
              ⚠ Soil saturation elevated — confirm row trafficability before dispatch.
            </span>
          )}
          {info.badge === 'HEAT PROVISIONS REQUIRED' && (
            <div className="heatDayCard__tooltipBlock">
              <LabeledDataRow label="Start" value={info.startTime} />
              {info.crosses80Time && (
                <LabeledDataRow label="Crosses 80°F" value={info.crosses80Time} />
              )}
              {info.dropsBelow80Time && (
                <LabeledDataRow label="Drops below 80°F" value={info.dropsBelow80Time} />
              )}
              {info.flagLine && (
                <div className="heatDayCard__tooltipFlag" data-severity="amber">
                  ⚑ {info.flagLine}
                </div>
              )}
            </div>
          )}
          {info.badge === 'HIGH-HEAT PROTOCOL ACTIVE' && (
            <div className="heatDayCard__tooltipBlock">
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
                <div className="heatDayCard__tooltipFlag" data-severity="red">
                  ⚑ {info.flagLine}
                </div>
              )}
            </div>
          )}
          {info.trafficabilityWarning && (
            <div className="heatDayCard__tooltipDivider">
              <span className="heatDayCard__tooltipNote">
                ⚠ Soil saturation elevated — confirm row trafficability before dispatch.
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
