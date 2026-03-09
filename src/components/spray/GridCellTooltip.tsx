import type { StatusColor } from '../../constants';
import type { WeatherHour, FieldState } from '../../types';
import { windDirectionFromDegrees } from '../../types';
import './GridCellTooltip.css';

interface GridCellTooltipProps {
  dayLabel: string;
  timeLabel: string;
  status: StatusColor | null;
  weather: WeatherHour;
  fieldState: FieldState;
}

export function GridCellTooltip({
  dayLabel: _dayLabel,
  timeLabel,
  status,
  weather,
  fieldState,
}: GridCellTooltipProps) {
  const statusLabel = status === 'green' ? 'Optimal' : status === 'amber' ? 'Caution' : 'Unfavorable';
  const statusKey = status ?? 'green';

  return (
    <div className="gridCellTooltip__root">
      <div className="gridCellTooltip__header">
        <span className="gridCellTooltip__time">{timeLabel}</span>
        {status && (
          <span
            className="gridCellTooltip__status"
            data-status={statusKey}
          >
            {statusLabel.toUpperCase()}
          </span>
        )}
      </div>
      <div className="gridCellTooltip__divider" />
      <div className="gridCellTooltip__sub">
        {status === 'green' ? 'Optimal conditions' : status === 'amber' ? 'Caution' : 'Unfavorable'}
      </div>
      <div className="gridCellTooltip__divider" />
      <div className="gridCellTooltip__rows">
        <div className="gridCellTooltip__row">
          <span className="label-caps">Wind</span>
          <span className="value-mono gridCellTooltip__value">
            {Math.round(weather.windspeed_10m)} mph → {windDirectionFromDegrees(weather.winddirection_10m)}
          </span>
        </div>
        <div className="gridCellTooltip__row">
          <span className="label-caps">Humidity</span>
          <span className="value-mono gridCellTooltip__value">{weather.relative_humidity_2m}%</span>
        </div>
        <div className="gridCellTooltip__row">
          <span className="label-caps">Rain prob</span>
          <span className="value-mono gridCellTooltip__value">{weather.precipitation_probability}%</span>
        </div>
        <div className="gridCellTooltip__row">
          <span className="label-caps">Soil</span>
          <span className="value-mono gridCellTooltip__value">{fieldState.soilMoisture}%</span>
        </div>
      </div>
    </div>
  );
}
