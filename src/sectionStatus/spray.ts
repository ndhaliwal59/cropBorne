import type { PairedHour } from '../types';
import type { StatusColor } from '../constants';
import { THRESHOLDS } from '../constants';

export function getSprayStatusForHour(paired: PairedHour[], index: number): StatusColor | null {
  if (index < 0 || index >= paired.length) return null;
  const { weatherHour, fieldState } = paired[index];
  const T = THRESHOLDS.spray;
  const wind = weatherHour.windspeed_10m;
  const humidity = weatherHour.relative_humidity_2m;
  const rainProb = weatherHour.precipitation_probability;
  const soil = fieldState.soilMoisture;
  const inversion = wind <= T.inversionWindMaxMph;

  if (wind < T.windMinMph || wind > T.windMaxMph) return 'red';
  if (humidity > T.humidityMaxPercent) return 'red';
  if (rainProb > 50) return 'red';
  if (soil > T.soilSaturationMaxPercent) return 'red';
  if (inversion) return 'amber';
  return 'green';
}

/** Worst status in next 7 days (168 hours) from startIndex */
export function getSpraySectionStatus(paired: PairedHour[], startIndex: number): StatusColor | null {
  let worst: StatusColor | null = null;
  for (let i = startIndex; i < Math.min(startIndex + 168, paired.length); i++) {
    const s = getSprayStatusForHour(paired, i);
    if (s === 'red') return 'red';
    if (s === 'amber') worst = 'amber';
    if (s === 'green' && worst !== 'amber') worst = 'green';
  }
  return worst;
}
