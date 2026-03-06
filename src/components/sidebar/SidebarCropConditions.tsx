import { ConditionBar } from '../ui/ConditionBar';
import { THRESHOLDS } from '../../constants';
import type { StatusColor } from '../../constants';
import type { WeatherHour } from '../../types';
import type { FieldState } from '../../types';

const T = THRESHOLDS.conditionBar.temp;
const S = THRESHOLDS.conditionBar.soilWater;
const C = THRESHOLDS.conditionBar.cloudCover;
const W = THRESHOLDS.conditionBar.wind;

function getTempStatus(tempF: number): { color: StatusColor; label: string } {
  if (tempF < T.frostRiskBelowF) return { color: 'red', label: 'FROST RISK' };
  if (tempF <= T.coolMaxF) return { color: 'amber', label: 'COOL' };
  if (tempF <= T.optimalMaxF) return { color: 'green', label: 'OPTIMAL' };
  if (tempF <= T.elevatedMaxF) return { color: 'amber', label: 'ELEVATED' };
  return { color: 'red', label: 'HEAT STRESS' };
}

function getSoilStatus(pct: number): { color: StatusColor; label: string } {
  if (pct <= S.droughtMaxPercent) return { color: 'red', label: 'DROUGHT' };
  if (pct <= S.dryMaxPercent) return { color: 'amber', label: 'DRY' };
  if (pct <= S.optimalMaxPercent) return { color: 'green', label: 'OPTIMAL' };
  if (pct <= S.saturatedMaxPercent) return { color: 'amber', label: 'SATURATED' };
  return { color: 'red', label: 'WATERLOGGED' };
}

function getSunlightStatus(cloudPct: number): { color: StatusColor; label: string } {
  if (cloudPct <= C.fullSunMaxPercent) return { color: 'green', label: 'FULL SUN' };
  if (cloudPct <= C.partialMaxPercent) return { color: 'amber', label: 'PARTIAL' };
  return { color: 'red', label: 'OVERCAST' };
}

function getWindStatus(mph: number): { color: StatusColor; label: string } {
  if (mph <= W.stillMaxMph) return { color: 'amber', label: 'STILL' };
  if (mph <= W.optimalMaxMph) return { color: 'green', label: 'OPTIMAL' };
  if (mph <= W.elevatedMaxMph) return { color: 'amber', label: 'ELEVATED' };
  return { color: 'red', label: 'HIGH' };
}

function sunlightLabel(cloudCover: number): string {
  if (cloudCover <= 20) return 'FULL SUN';
  if (cloudCover <= 50) return 'PARTIAL';
  return 'OVERCAST';
}

interface SidebarCropConditionsProps {
  weather: WeatherHour;
  fieldState: FieldState;
}

export function SidebarCropConditions({ weather, fieldState }: SidebarCropConditionsProps) {
  const tempF = weather.temperature_2m;
  const tempStatus = getTempStatus(tempF);
  const soilStatus = getSoilStatus(fieldState.soilMoisture);
  const cloudCover = weather.cloudcover;
  const sunStatus = getSunlightStatus(cloudCover);
  const windMph = weather.windspeed_10m;
  const windStatus = getWindStatus(windMph);

  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: 'var(--green)',
          }}
        />
      </div>
      <div className="label-caps" style={{ marginBottom: 12 }}>
        Crop conditions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ConditionBar
          label="Temperature"
          valueLabel={`${Math.round(tempF)}°F`}
          value={tempF}
          min={20}
          max={110}
          zones={[
            { upTo: (T.frostRiskBelowF - 20) / 90, color: 'var(--red)', statusLabel: 'FROST RISK' },
            { upTo: (T.coolMaxF - 20) / 90, color: 'var(--amber)', statusLabel: 'COOL' },
            { upTo: (T.optimalMaxF - 20) / 90, color: 'var(--green)', statusLabel: 'OPTIMAL' },
            { upTo: (T.elevatedMaxF - 20) / 90, color: 'var(--amber)', statusLabel: 'ELEVATED' },
            { upTo: 1, color: 'var(--red)', statusLabel: 'HEAT STRESS' },
          ]}
          statusColor={tempStatus.color}
        />
        <ConditionBar
          label="Soil water"
          valueLabel={`${fieldState.soilMoisture}%`}
          value={fieldState.soilMoisture}
          min={0}
          max={100}
          zones={[
            { upTo: S.droughtMaxPercent / 100, color: 'var(--red)', statusLabel: 'DROUGHT' },
            { upTo: S.dryMaxPercent / 100, color: 'var(--amber)', statusLabel: 'DRY' },
            { upTo: S.optimalMaxPercent / 100, color: 'var(--green)', statusLabel: 'OPTIMAL' },
            { upTo: S.saturatedMaxPercent / 100, color: 'var(--amber)', statusLabel: 'SATURATED' },
            { upTo: 1, color: 'var(--red)', statusLabel: 'WATERLOGGED' },
          ]}
          statusColor={soilStatus.color}
        />
        <ConditionBar
          label="Sunlight"
          valueLabel={`${sunlightLabel(cloudCover)} ${cloudCover}%`}
          value={cloudCover}
          min={0}
          max={100}
          zones={[
            { upTo: 0.2, color: 'var(--green)', statusLabel: 'FULL SUN' },
            { upTo: 0.5, color: 'var(--amber)', statusLabel: 'PARTIAL' },
            { upTo: 1, color: 'var(--red)', statusLabel: 'OVERCAST' },
          ]}
          statusColor={sunStatus.color}
        />
        <ConditionBar
          label="Wind"
          valueLabel={`${Math.round(windMph)} mph`}
          value={windMph}
          min={0}
          max={25}
          zones={[
            { upTo: W.stillMaxMph / 25, color: 'var(--amber)', statusLabel: 'STILL' },
            { upTo: W.optimalMaxMph / 25, color: 'var(--green)', statusLabel: 'OPTIMAL' },
            { upTo: W.elevatedMaxMph / 25, color: 'var(--amber)', statusLabel: 'ELEVATED' },
            { upTo: 1, color: 'var(--red)', statusLabel: 'HIGH' },
          ]}
          statusColor={windStatus.color}
        />
      </div>
    </div>
  );
}
