import type { PairedHour } from './types';
import { THRESHOLDS } from './constants';

const T = THRESHOLDS.disease;

export type DiseaseSeverity = 'NO_ALERT' | 'WATCH' | 'WARNING';

export interface DiseasePanelState {
  severity: DiseaseSeverity;
  riskBeginsInHours: number | null;
  sustainedHours: number | null;
  message: string;
  actionLine: string;
}

function getDiseaseState(paired: PairedHour[], startIndex: number): DiseasePanelState {
  let riskStart: number | null = null;
  let sustainedCount = 0;
  let maxSustained = 0;
  const limit = Math.min(startIndex + T.lookaheadHours, paired.length);

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
    maxSustained >= T.sustainedHoursWarning && paired[startIndex]?.fieldState.leafWetness >= T.leafWetnessWarning
      ? 'WARNING'
      : maxSustained >= T.sustainedHoursWatch || (riskStart !== null && sustainedCount > 0)
        ? 'WATCH'
        : 'NO_ALERT';

  const message =
    severity === 'WARNING'
      ? 'Powdery mildew conditions developing. High temperatures and humidity forecast.'
      : severity === 'WATCH'
        ? 'Conditions favorable for powdery mildew. Monitor leaf wetness and temperature.'
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

export function getPowderyMildewState(paired: PairedHour[], startIndex: number): DiseasePanelState {
  return getDiseaseState(paired, startIndex);
}

export function getDownyMildewState(paired: PairedHour[], startIndex: number): DiseasePanelState {
  return getDiseaseState(paired, startIndex);
}
