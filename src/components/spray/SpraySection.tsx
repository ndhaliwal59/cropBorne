import type { PairedHour } from '../../types';
import { DailySummaryStrip } from './DailySummaryStrip';
import { HourlyGrid } from './HourlyGrid';
import './SpraySection.css';

interface SpraySectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function SpraySection({ paired, nowIndex }: SpraySectionProps) {

  return (
    <section id="spray" className="spraySection__section">
      <h2 className="spraySection__title">SPRAY WINDOW ADVISABILITY</h2>
      <p className="spraySection__sub">
        7-day hourly analysis · Wind · Humidity · Precipitation · Field saturation
      </p>
      <DailySummaryStrip paired={paired} nowIndex={nowIndex} />
      <HourlyGrid paired={paired} nowIndex={nowIndex} />
    </section>
  );
}
