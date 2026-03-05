import type { StatusColor } from '../../constants';

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
  const statusStyles: Record<StatusColor, React.CSSProperties> = {
    green: { color: 'var(--green)' },
    amber: { color: 'var(--amber)' },
    red: { color: 'var(--red)' },
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="label-caps">{label}</span>
        <span className="value-mono" style={{ fontSize: '14px' }}>
          {valueLabel}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20 }}>
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: `linear-gradient(to right, ${gradientStops})`,
            marginTop: 14,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${positionPercent}%`,
            transform: 'translateX(-1px)',
            top: 0,
            width: 2,
            height: 14,
            backgroundColor: '#fff',
            borderRadius: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${positionPercent}%`,
            transform: 'translateX(-2px)',
            top: 12,
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#fff',
          }}
        />
      </div>
      <div style={{ textAlign: 'right' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            ...statusStyles[statusColor],
          }}
        >
          {currentZone.statusLabel}
        </span>
      </div>
    </div>
  );
}
