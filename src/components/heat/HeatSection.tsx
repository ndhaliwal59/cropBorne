import type { PairedHour } from '../../types';
import { getHeatDayInfo } from '../../heatLogic';
import { HeatDayCard } from './HeatDayCard';

interface HeatSectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function HeatSection({ paired, nowIndex }: HeatSectionProps) {
  const todayStart = Math.floor(nowIndex / 24) * 24;
  const cards = [];
  for (let d = 0; d < 7; d++) {
    const dayStart = todayStart + d * 24;
    if (dayStart + 24 > paired.length) break;
    const isToday = d === 0;
    cards.push(
      <HeatDayCard key={d} info={getHeatDayInfo(paired, dayStart, isToday)} />
    );
  }

  return (
    <section id="heat" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
        HEAT STRESS & LABOR COMPLIANCE
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Cal/OSHA threshold monitoring · Daily shift scheduling · Field trafficability
      </p>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>{cards}</div>
    </section>
  );
}
