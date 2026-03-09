import type { PairedHour } from './types';
import { THRESHOLDS } from './constants';

const LOOKAHEAD = THRESHOLDS.disease.lookaheadHours;

export type DiseaseSeverity = 'NO_ALERT' | 'WATCH' | 'WARNING';

export interface DiseasePanelState {
  severity: DiseaseSeverity;
  riskBeginsInHours: number | null;
  sustainedHours: number | null;
  message: string;
  actionLine: string;
}

/** Downy mildew: driven by leaf wetness (free moisture). Risk when wet foliage is sustained. */
export function getDownyMildewState(paired: PairedHour[], startIndex: number): DiseasePanelState {
  const T = THRESHOLDS.disease.downy;
  let riskStart: number | null = null;
  let sustainedCount = 0;
  let maxSustained = 0;
  const limit = Math.min(startIndex + LOOKAHEAD, paired.length);

  for (let i = startIndex; i < limit; i++) {
    const lw = paired[i].fieldState.leafWetness;
    if (lw >= T.leafWetnessWatch) {
      if (riskStart === null) riskStart = i - startIndex;
      sustainedCount++;
      maxSustained = Math.max(maxSustained, sustainedCount);
    } else {
      sustainedCount = 0;
    }
  }

  const severity: DiseaseSeverity =
    maxSustained >= T.sustainedHoursWarning &&
    (paired[startIndex]?.fieldState.leafWetness ?? 0) >= T.leafWetnessWarning
      ? 'WARNING'
      : maxSustained >= T.sustainedHoursWatch || (riskStart !== null && sustainedCount > 0)
        ? 'WATCH'
        : 'NO_ALERT';

  const message =
    severity === 'WARNING'
      ? 'Prolonged leaf wetness favors downy mildew. Free moisture on foliage present.'
      : severity === 'WATCH'
        ? 'Conditions favorable for downy mildew. Monitor leaf wetness and reduce prolonged wet periods.'
        : '';

  const actionLine =
    severity === 'WARNING' || severity === 'WATCH'
      ? '→ Consider fungicide application when foliage will be dry.'
      : '';

  return {
    severity,
    riskBeginsInHours: riskStart,
    sustainedHours: maxSustained > 0 ? maxSustained : null,
    message,
    actionLine,
  };
}

/** Powdery mildew: driven by high humidity (not necessarily leaf wetness). Risk when RH is high for sustained hours in favorable temp range. */
export function getPowderyMildewState(paired: PairedHour[], startIndex: number): DiseasePanelState {
  const T = THRESHOLDS.disease.powdery;
  let riskStart: number | null = null;
  let sustainedCount = 0;
  let maxSustained = 0;
  const limit = Math.min(startIndex + LOOKAHEAD, paired.length);

  for (let i = startIndex; i < limit; i++) {
    const rh = paired[i].weatherHour.relative_humidity_2m;
    const tempF = paired[i].weatherHour.temperature_2m;
    const inRange = rh >= T.humidityMinPercent && tempF >= T.tempMinF && tempF <= T.tempMaxF;
    if (inRange) {
      if (riskStart === null) riskStart = i - startIndex;
      sustainedCount++;
      maxSustained = Math.max(maxSustained, sustainedCount);
    } else {
      sustainedCount = 0;
    }
  }

  const severity: DiseaseSeverity =
    maxSustained >= T.sustainedHoursWarning
      ? 'WARNING'
      : maxSustained >= T.sustainedHoursWatch || (riskStart !== null && sustainedCount > 0)
        ? 'WATCH'
        : 'NO_ALERT';

  const message =
    severity === 'WARNING'
      ? 'High humidity and moderate temperatures favor powdery mildew development.'
      : severity === 'WATCH'
        ? 'Conditions favorable for powdery mildew. Monitor humidity and canopy density.'
        : '';

  const actionLine =
    severity === 'WARNING' || severity === 'WATCH'
      ? '→ Consider fungicide application within 24 hours.'
      : '';

  return {
    severity,
    riskBeginsInHours: riskStart,
    sustainedHours: maxSustained > 0 ? maxSustained : null,
    message,
    actionLine,
  };
}
