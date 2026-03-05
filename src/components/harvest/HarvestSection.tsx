import type { PairedHour } from '../../types';
import { getCommitWindow } from '../../harvestLogic';
import { CommitWindowBanner } from './CommitWindowBanner';
import { DryHourStreak } from './DryHourStreak';
import { TenDayRatingStrip } from './TenDayRatingStrip';

interface HarvestSectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function HarvestSection({ paired, nowIndex }: HarvestSectionProps) {
  const commitWindow = getCommitWindow(paired, nowIndex);
  const currentDryStreak = paired[nowIndex]?.fieldState.dryStreakHours ?? 0;

  return (
    <section id="harvest" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
        HARVEST LOGISTICS & DRY-DOWN FORECAST
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        10-day window analysis · Botrytis risk · Commit window
      </p>
      <CommitWindowBanner result={commitWindow} />
      <DryHourStreak dryStreakHours={currentDryStreak} />
      <TenDayRatingStrip paired={paired} nowIndex={nowIndex} />
    </section>
  );
}
