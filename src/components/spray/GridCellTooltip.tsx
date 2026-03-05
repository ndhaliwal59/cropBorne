import type { StatusColor } from '../../constants';
import type { WeatherHour, FieldState } from '../../types';
import { windDirectionFromDegrees } from '../../types';

interface GridCellTooltipProps {
  dayLabel: string;
  timeLabel: string;
  status: StatusColor | null;
  weather: WeatherHour;
  fieldState: FieldState;
}

export function GridCellTooltip({
  dayLabel,
  timeLabel,
  status,
  weather,
  fieldState,
}: GridCellTooltipProps) {
  const statusLabel = status === 'green' ? 'Optimal' : status === 'amber' ? 'Caution' : 'Unfavorable';
  const statusColor = status ?? 'green';

  return (
    <div
      style={{
        backgroundColor: 'var(--surface2)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-md)',
        padding: 12,
        minWidth: 220,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
          {dayLabel} · {timeLabel}
        </span>
        {status && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 700,
              color: `var(--${statusColor})`,
            }}
          >
            {statusLabel.toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ height: 1, backgroundColor: 'var(--border)', marginBottom: 8 }} />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
        {status === 'green' ? 'Optimal conditions' : status === 'amber' ? 'Caution' : 'Unfavorable'}
      </div>
      <div style={{ height: 1, backgroundColor: 'var(--border)', marginBottom: 8 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label-caps">Wind</span>
          <span className="value-mono" style={{ fontSize: 12 }}>
            {Math.round(weather.windspeed_10m)} mph → {windDirectionFromDegrees(weather.winddirection_10m)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label-caps">Humidity</span>
          <span className="value-mono" style={{ fontSize: 12 }}>{weather.relative_humidity_2m}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label-caps">Rain prob</span>
          <span className="value-mono" style={{ fontSize: 12 }}>{weather.precipitation_probability}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="label-caps">Soil</span>
          <span className="value-mono" style={{ fontSize: 12 }}>{fieldState.soilMoisture}%</span>
        </div>
      </div>
    </div>
  );
}
