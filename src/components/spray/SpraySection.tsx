import type { PairedHour } from '../../types';
import { DailySummaryStrip } from './DailySummaryStrip';
import { HourlyGrid } from './HourlyGrid';

interface SpraySectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function SpraySection({ paired, nowIndex }: SpraySectionProps) {

  return (
    <section id="spray" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
        SPRAY WINDOW ADVISABILITY
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        7-day hourly analysis · Wind · Humidity · Precipitation · Field saturation
      </p>
      <DailySummaryStrip paired={paired} nowIndex={nowIndex} />
      <HourlyGrid paired={paired} nowIndex={nowIndex} />
    </section>
  );
}
