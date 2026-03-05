import type { PairedHour } from '../types';
import type { StatusColor } from '../constants';
import { THRESHOLDS } from '../constants';

/** Harvest section: red if no window, amber if recovery, green if commit window found */
export function getHarvestSectionStatus(paired: PairedHour[], startIndex: number): StatusColor | null {
  const dryRequired = THRESHOLDS.harvest.dryStreakHoursRequired;
  const soilMax = THRESHOLDS.harvest.soilEntryMaxPercent;
  let foundWindow = false;
  let inRecovery = false;
  for (let i = startIndex; i < Math.min(startIndex + 240, paired.length); i++) {
    const fs = paired[i].fieldState;
    if (fs.dryStreakHours >= dryRequired && fs.soilMoisture <= soilMax) {
      foundWindow = true;
      break;
    }
    if (fs.dryStreakHours > 0 && fs.soilMoisture > soilMax) inRecovery = true;
  }
  if (foundWindow) return 'green';
  if (inRecovery) return 'amber';
  return 'red';
}
