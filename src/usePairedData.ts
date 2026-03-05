import { useMemo } from 'react';
import { MOCK_FORECAST } from './mockWeather';
import { runFieldStateEngine } from './fieldStateEngine';
import type { PairedHour } from './types';

/** "Now" = first hour of today for mock; in production would be actual current time index */
function getNowIndex(paired: PairedHour[]): number {
  if (paired.length === 0) return 0;
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  for (let i = 0; i < paired.length; i++) {
    const t = new Date(paired[i].weatherHour.time);
    if (t >= todayStart) return i;
  }
  return 0;
}

export function usePairedData(): { paired: PairedHour[]; nowIndex: number } {
  const paired = useMemo(() => runFieldStateEngine(MOCK_FORECAST), []);
  const nowIndex = useMemo(() => getNowIndex(paired), [paired]);
  return { paired, nowIndex };
}
