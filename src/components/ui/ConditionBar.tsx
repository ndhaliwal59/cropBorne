import type { StatusColor } from '../../constants';
import './ConditionBar.css';

interface ConditionBarProps {
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  /** Gradient stops 0–1 with color and status */
  zones: Array<{ upTo: number; color: string; statusLabel: string }>;
  /** For value position: value is in same units as min/max */
  statusColor: StatusColor;
}

export function ConditionBar({
  label,
  valueLabel,
  value,
  min,
  max,
  zones,
  statusColor,
}: ConditionBarProps) {
  const range = max - min || 1;
  const positionPercent = Math.min(100, Math.max(0, ((value - min) / range) * 100));

  let currentZone = zones[0];
  for (const z of zones) {
    if (value <= min + z.upTo * range) {
      currentZone = z;
      break;
    }
    currentZone = z;
  }

  const gradientStops = zones
    .map((z) => `${z.color} ${(z.upTo * 100).toFixed(1)}%`)
    .join(', ');

  return (
    <div className="conditionBar__root">
      <div className="conditionBar__header">
        <span className="label-caps">{label}</span>
        <span className="value-mono conditionBar__value">{valueLabel}</span>
      </div>
      <div className="conditionBar__trackWrap">
        <div
          className="conditionBar__track"
          style={{ background: `linear-gradient(to right, ${gradientStops})` }}
        />
        <div
          className="conditionBar__marker"
          style={{ left: `${positionPercent}%` }}
        />
        <div
          className="conditionBar__dot"
          style={{ left: `${positionPercent}%` }}
        />
      </div>
      <div className="conditionBar__status" data-status={statusColor}>
        {currentZone.statusLabel}
      </div>
    </div>
  );
}
