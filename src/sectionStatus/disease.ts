import type { PairedHour } from '../types';
import type { StatusColor } from '../constants';
import { THRESHOLDS } from '../constants';

const LOOKAHEAD = THRESHOLDS.disease.lookaheadHours;

/** Downy: severity from leaf wetness + sustained wet hours in lookahead */
function getDownySeverity(paired: PairedHour[], startIndex: number): StatusColor {
  const T = THRESHOLDS.disease.downy;
  let maxLeafWetness = 0;
  let sustainedWetHours = 0;
  for (let i = startIndex; i < Math.min(startIndex + LOOKAHEAD, paired.length); i++) {
    const lw = paired[i].fieldState.leafWetness;
    maxLeafWetness = Math.max(maxLeafWetness, lw);
    if (lw >= T.leafWetnessWatch) sustainedWetHours++;
  }
  if (maxLeafWetness >= T.leafWetnessWarning && sustainedWetHours >= T.sustainedHoursWarning) return 'red';
  if (maxLeafWetness >= T.leafWetnessWatch && sustainedWetHours >= T.sustainedHoursWatch) return 'amber';
  return 'green';
}

/** Powdery: severity from high RH + favorable temp sustained hours in lookahead */
function getPowderySeverity(paired: PairedHour[], startIndex: number): StatusColor {
  const T = THRESHOLDS.disease.powdery;
  let sustainedHours = 0;
  for (let i = startIndex; i < Math.min(startIndex + LOOKAHEAD, paired.length); i++) {
    const rh = paired[i].weatherHour.relative_humidity_2m;
    const tempF = paired[i].weatherHour.temperature_2m;
    if (rh >= T.humidityMinPercent && tempF >= T.tempMinF && tempF <= T.tempMaxF) sustainedHours++;
  }
  if (sustainedHours >= T.sustainedHoursWarning) return 'red';
  if (sustainedHours >= T.sustainedHoursWatch) return 'amber';
  return 'green';
}

/** Worst of powdery and downy severity in the lookahead window */
export function getDiseaseSectionStatus(paired: PairedHour[], startIndex: number): StatusColor | null {
  const downy = getDownySeverity(paired, startIndex);
  const powdery = getPowderySeverity(paired, startIndex);
  if (downy === 'red' || powdery === 'red') return 'red';
  if (downy === 'amber' || powdery === 'amber') return 'amber';
  return null;
}

export function hasActiveDiseaseAlert(paired: PairedHour[], startIndex: number): boolean {
  return getDiseaseSectionStatus(paired, startIndex) !== null;
}
