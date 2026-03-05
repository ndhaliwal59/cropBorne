import type { PairedHour } from '../types';
import type { StatusColor } from '../constants';
import { THRESHOLDS } from '../constants';

function getHeatStatusForDay(dayPairs: PairedHour[]): StatusColor {
  const T = THRESHOLDS.heat;
  const maxTemp = Math.max(...dayPairs.map((p) => p.weatherHour.temperature_2m));
  if (maxTemp >= T.highHeatTempF) return 'red';
  if (maxTemp >= T.provisionsTempF) return 'amber';
  return 'green';
}

/** Worst status in next 7 days from startIndex */
export function getHeatSectionStatus(paired: PairedHour[], startIndex: number): StatusColor | null {
  let worst: StatusColor = 'green';
  for (let d = 0; d < 7; d++) {
    const dayStart = startIndex + d * 24;
    const dayPairs = paired.slice(dayStart, dayStart + 24).filter((_, i) => dayStart + i < paired.length);
    if (dayPairs.length === 0) break;
    const s = getHeatStatusForDay(dayPairs);
    if (s === 'red') return 'red';
    if (s === 'amber') worst = 'amber';
  }
  return worst;
}
