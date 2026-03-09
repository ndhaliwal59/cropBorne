import type { PairedHour } from '../../types';
import { getHeatDayInfo } from '../../heatLogic';
import { HeatDayCard } from './HeatDayCard';
import './HeatSection.css';

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
    <section id="heat" className="heatSection__section">
      <h2 className="heatSection__title">HEAT STRESS & LABOR COMPLIANCE</h2>
      <p className="heatSection__sub">
        Cal/OSHA threshold monitoring · Daily shift scheduling · Field trafficability
      </p>
      <div className="heatSection__scroll">{cards}</div>
    </section>
  );
}
