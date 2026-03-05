import type { PairedHour } from '../types';
import type { StatusColor } from '../constants';
import { THRESHOLDS } from '../constants';

/** Simplified: WARNING if leaf wetness high + sustained hours in 48h, else WATCH if elevated, else green */
function getDiseaseSeverity(paired: PairedHour[], startIndex: number): StatusColor {
  const T = THRESHOLDS.disease;
  let maxLeafWetness = 0;
  let sustainedWetHours = 0;
  for (let i = startIndex; i < Math.min(startIndex + T.lookaheadHours, paired.length); i++) {
    const lw = paired[i].fieldState.leafWetness;
    maxLeafWetness = Math.max(maxLeafWetness, lw);
    if (lw >= T.leafWetnessWatch) sustainedWetHours++;
  }
  if (maxLeafWetness >= T.leafWetnessWarning && sustainedWetHours >= T.sustainedHoursWarning) return 'red';
  if (maxLeafWetness >= T.leafWetnessWatch && sustainedWetHours >= T.sustainedHoursWatch) return 'amber';
  return 'green';
}

/** Worst of powdery and downy (both use same logic for now) */
export function getDiseaseSectionStatus(paired: PairedHour[], startIndex: number): StatusColor | null {
  const s = getDiseaseSeverity(paired, startIndex);
  return s === 'green' ? null : s;
}

export function hasActiveDiseaseAlert(paired: PairedHour[], startIndex: number): boolean {
  return getDiseaseSectionStatus(paired, startIndex) !== null;
}
