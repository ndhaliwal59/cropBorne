import type { PairedHour } from './types';
import type { StatusColor } from './constants';
import { THRESHOLDS } from './constants';

const T = THRESHOLDS.heat;

export interface HeatDayInfo {
  dayLabel: string;
  dateLabel: string;
  maxTempF: number;
  status: StatusColor;
  badge: 'STANDARD' | 'HEAT PROVISIONS REQUIRED' | 'HIGH-HEAT PROTOCOL ACTIVE';
  startTime: string;
  crosses80Time: string | null;
  dropsBelow80Time: string | null;
  crosses95Time: string | null;
  breakCadence: string | null;
  compliantHours: number | null;
  flagLine: string | null;
  isToday: boolean;
  trafficabilityWarning: boolean;
  soilMoisture: number;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

export function getHeatDayInfo(
  paired: PairedHour[],
  dayStartIndex: number,
  isToday: boolean
): HeatDayInfo {
  const dayPairs = paired.slice(dayStartIndex, dayStartIndex + 24);
  if (dayPairs.length === 0) {
    return {
      dayLabel: '',
      dateLabel: '',
      maxTempF: 0,
      status: 'green',
      badge: 'STANDARD',
      startTime: '',
      crosses80Time: null,
      dropsBelow80Time: null,
      crosses95Time: null,
      breakCadence: null,
      compliantHours: null,
      flagLine: null,
      isToday,
      trafficabilityWarning: false,
      soilMoisture: 0,
    };
  }

  const firstHour = dayPairs[0].weatherHour.time;
  const d = new Date(firstHour);
  const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const maxTempF = Math.max(...dayPairs.map((p) => p.weatherHour.temperature_2m));
  const soilMoisture = dayPairs[dayPairs.length - 1]?.fieldState.soilMoisture ?? 0;
  const trafficabilityWarning = soilMoisture > THRESHOLDS.harvest.soilSaturationTrafficabilityPercent;

  let status: StatusColor = 'green';
  let badge: HeatDayInfo['badge'] = 'STANDARD';
  let crosses80Time: string | null = null;
  let dropsBelow80Time: string | null = null;
  let crosses95Time: string | null = null;
  let breakCadence: string | null = null;
  let compliantHours: number | null = null;
  let flagLine: string | null = null;
  let startTime = '6:00 AM';

  if (maxTempF >= T.highHeatTempF) {
    status = 'red';
    badge = 'HIGH-HEAT PROTOCOL ACTIVE';
    for (let i = 0; i < dayPairs.length; i++) {
      if (dayPairs[i].weatherHour.temperature_2m >= T.highHeatTempF) {
        crosses95Time = formatTime(dayPairs[i].weatherHour.time);
        break;
      }
    }
    startTime = '4:00 AM';
    breakCadence = '10 min / hr';
    compliantHours = 6;
    flagLine = `High-heat protocol active from ${crosses95Time ?? '—'}`;
  } else if (maxTempF >= T.provisionsTempF) {
    status = 'amber';
    badge = 'HEAT PROVISIONS REQUIRED';
    for (let i = 0; i < dayPairs.length; i++) {
      if (dayPairs[i].weatherHour.temperature_2m >= T.provisionsTempF) {
        crosses80Time = formatTime(dayPairs[i].weatherHour.time);
        break;
      }
    }
    for (let i = dayPairs.length - 1; i >= 0; i--) {
      if (dayPairs[i].weatherHour.temperature_2m < T.provisionsTempF) {
        dropsBelow80Time = formatTime(dayPairs[i].weatherHour.time);
        break;
      }
    }
    startTime = '5:30 AM';
    if (!dropsBelow80Time) dropsBelow80Time = '5:30 PM';
    flagLine = `Shade & water required from ${crosses80Time ?? '—'}`;
  } else {
    flagLine = null;
  }

  return {
    dayLabel,
    dateLabel,
    maxTempF,
    status,
    badge,
    startTime,
    crosses80Time,
    dropsBelow80Time,
    crosses95Time,
    breakCadence,
    compliantHours,
    flagLine,
    isToday,
    trafficabilityWarning,
    soilMoisture,
  };
}
