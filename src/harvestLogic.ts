import type { PairedHour } from './types';
import type { StatusColor } from './constants';
import { THRESHOLDS } from './constants';

const DRY_REQUIRED = THRESHOLDS.harvest.dryStreakHoursRequired;
const SOIL_MAX = THRESHOLDS.harvest.soilEntryMaxPercent;

export type CommitWindowState = 'WINDOW' | 'RECOVERY' | 'NO_WINDOW';

export interface CommitWindowResult {
  state: CommitWindowState;
  windowStartIndex?: number;
  windowEndIndex?: number;
  windowStartDate?: string;
  windowEndDate?: string;
  windowDays?: number;
  dispatchByDate?: string;
  dryStreakHits48Date?: string;
  soilOnEntryDay?: number;
  earliestViableEntry?: string;
  dryStreakHours?: number;
  hoursRemaining?: number;
  soilMoisture?: number;
  soilProjectedBy?: string;
}

export function getCommitWindow(paired: PairedHour[], startIndex: number): CommitWindowResult {
  let firstViableStart: number | null = null;
  let firstViableEnd: number | null = null;
  let inRecovery = false;
  let recoveryDryStreak = 0;
  let recoverySoil = 0;

  for (let i = startIndex; i < Math.min(startIndex + 240, paired.length); i++) {
    const fs = paired[i].fieldState;
    if (fs.dryStreakHours >= DRY_REQUIRED && fs.soilMoisture <= SOIL_MAX) {
      if (firstViableStart === null) {
        firstViableStart = i;
        firstViableEnd = i;
      } else {
        firstViableEnd = i;
      }
    } else {
      if (firstViableStart !== null) break;
      if (fs.dryStreakHours > 0 && fs.soilMoisture > SOIL_MAX) {
        inRecovery = true;
        recoveryDryStreak = fs.dryStreakHours;
        recoverySoil = fs.soilMoisture;
      }
    }
  }

  if (firstViableStart !== null && firstViableEnd !== null) {
    const startDate = new Date(paired[firstViableStart].weatherHour.time);
    const endDate = new Date(paired[firstViableEnd].weatherHour.time);
    const windowDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const dispatchBy = new Date(startDate);
    dispatchBy.setDate(dispatchBy.getDate() - 1);
    const soilOnEntry = paired[firstViableStart].fieldState.soilMoisture;
    let dryHits48Index = startIndex;
    for (let i = startIndex; i <= firstViableStart; i++) {
      if (paired[i].fieldState.dryStreakHours >= DRY_REQUIRED) {
        dryHits48Index = i;
        break;
      }
    }
    const dryStreakHits48Date = new Date(paired[dryHits48Index].weatherHour.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).toUpperCase();

    return {
      state: 'WINDOW',
      windowStartIndex: firstViableStart,
      windowEndIndex: firstViableEnd,
      windowStartDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      windowEndDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
      windowDays: Math.min(windowDays, 10),
      dispatchByDate: dispatchBy.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + ' · EOD',
      dryStreakHits48Date,
      soilOnEntryDay: soilOnEntry,
    };
  }

  if (inRecovery) {
    for (let i = startIndex; i < Math.min(startIndex + 240, paired.length); i++) {
      if (paired[i].fieldState.soilMoisture <= SOIL_MAX) {
        return {
          state: 'RECOVERY',
          earliestViableEntry: new Date(paired[i].weatherHour.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
          dryStreakHours: recoveryDryStreak,
          hoursRemaining: Math.max(0, DRY_REQUIRED - recoveryDryStreak),
          soilMoisture: recoverySoil,
          soilProjectedBy: new Date(paired[i].weatherHour.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        };
      }
    }
    return {
      state: 'RECOVERY',
      earliestViableEntry: '—',
      dryStreakHours: recoveryDryStreak,
      hoursRemaining: Math.max(0, DRY_REQUIRED - recoveryDryStreak),
      soilMoisture: recoverySoil,
      soilProjectedBy: '—',
    };
  }

  return { state: 'NO_WINDOW' };
}

export function getDayRating(
  paired: PairedHour[],
  dayStartIndex: number
): { rating: 'CLEAR' | 'MARGINAL' | 'HOLD'; status: StatusColor; botrytis: string; dryHours: string; rainProb: number } {
  const dayPairs = paired.slice(dayStartIndex, dayStartIndex + 24);
  if (dayPairs.length === 0) {
    return { rating: 'HOLD', status: 'red', botrytis: '—', dryHours: '—', rainProb: 0 };
  }
  const last = dayPairs[dayPairs.length - 1];
  const rainProb = Math.max(...dayPairs.map((p) => p.weatherHour.precipitation_probability));
  const dryHours = last.fieldState.dryStreakHours;
  const dryStr =
    dryHours >= 48 ? '48' : dryHours >= 24 ? '24' : dryHours >= 8 ? '8' : String(dryHours);
  let botrytis = 'LOW';
  let status: StatusColor = 'green';
  if (rainProb > 50) {
    botrytis = 'HIGH';
    status = 'red';
  } else if (rainProb > 20) {
    botrytis = 'MODERATE';
    status = 'amber';
  }
  const rating = status === 'green' ? 'CLEAR' : status === 'amber' ? 'MARGINAL' : 'HOLD';
  return {
    rating,
    status,
    botrytis,
    dryHours: dryStr + '+',
    rainProb,
  };
}
