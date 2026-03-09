import type { PairedHour } from '../../types';
import { getCommitWindow } from '../../harvestLogic';
import { CommitWindowBanner } from './CommitWindowBanner';
import { HarvestTimeline } from './HarvestTimeline';
import './HarvestSection.css';

interface HarvestSectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function HarvestSection({ paired, nowIndex }: HarvestSectionProps) {
  const commitWindow = getCommitWindow(paired, nowIndex);
  const currentDryStreak = paired[nowIndex]?.fieldState.dryStreakHours ?? 0;

  return (
    <section id="harvest" className="harvestSection__section">
      <h2 className="harvestSection__title">
        HARVEST LOGISTICS & DRY-DOWN FORECAST
      </h2>
      <p className="harvestSection__sub">
        7-day window analysis · Botrytis risk
        {' · '}
        <span className="harvestSection__dryStreak">DRY STREAK {currentDryStreak} hrs ✓</span>
      </p>
      {commitWindow.state !== 'WINDOW' && (
        <CommitWindowBanner result={commitWindow} dryStreakHours={currentDryStreak} />
      )}
      <HarvestTimeline paired={paired} nowIndex={nowIndex} />
    </section>
  );
}
