import type { PairedHour } from './types';
import { THRESHOLDS } from './constants';
import { getSprayStatusForHour } from './sectionStatus/spray';

const MIN_CONSECUTIVE = THRESHOLDS.spray.minConsecutiveHours;

export interface SprayWindow {
  startIndex: number;
  endIndex: number;
  startTime: string;
  endTime: string;
  hours: number;
}

export function getBestWindowForDay(
  paired: PairedHour[],
  dayStartIndex: number
): { start: string; end: string; hours: number } | null {
  const dayEnd = dayStartIndex + 24;
  let bestRun: { start: number; end: number } | null = null;
  let runStart: number | null = null;
  for (let i = dayStartIndex; i < dayEnd && i < paired.length; i++) {
    const status = getSprayStatusForHour(paired, i);
    if (status === 'green') {
      if (runStart === null) runStart = i;
      const runLen = i - runStart + 1;
      if (
        runLen >= MIN_CONSECUTIVE &&
        (!bestRun || runLen > (bestRun.end - bestRun.start + 1))
      ) {
        bestRun = { start: runStart, end: i };
      }
    } else {
      runStart = null;
    }
  }
  if (!bestRun) return null;
  const startTime = paired[bestRun.start].weatherHour.time;
  const endTime = paired[bestRun.end].weatherHour.time;
  const hours = bestRun.end - bestRun.start + 1;
  return {
    start: formatTime(startTime),
    end: formatTime(endTime),
    hours,
  };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}${am ? 'AM' : 'PM'}`;
}

export function formatDayDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const date = d.getDate();
  return `${day} ${mon} ${date}`;
}
