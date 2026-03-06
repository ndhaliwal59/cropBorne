import { LeftAccentBlock } from '../ui/LeftAccentBlock';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import type { CommitWindowResult } from '../../harvestLogic';

interface CommitWindowBannerProps {
  result: CommitWindowResult;
  dryStreakHours?: number;
}

export function CommitWindowBanner({ result, dryStreakHours = 0 }: CommitWindowBannerProps) {
  if (result.state === 'WINDOW') {
    return (
      <LeftAccentBlock accent="green">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            ✓ Send crews {result.windowStartDate} · Dispatch by {result.dispatchByDate ?? '—'}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>
            DRY STREAK {dryStreakHours} hrs ✓
          </span>
        </div>
      </LeftAccentBlock>
    );
  }

  if (result.state === 'RECOVERY') {
    return (
      <LeftAccentBlock accent="amber">
        <div className="label-caps" style={{ marginBottom: 8 }}>RECOVERY IN PROGRESS</div>
        <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '8px 0' }} />
        <LabeledDataRow label="EARLIEST VIABLE ENTRY" value={result.earliestViableEntry ?? '—'} />
        <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '8px 0' }} />
        <LabeledDataRow
          label="DRY STREAK"
          value={`${result.dryStreakHours ?? 0} hrs  ·  ${result.hoursRemaining ?? 0} hrs remaining`}
        />
        <LabeledDataRow
          label="SOIL MOISTURE"
          value={`${result.soilMoisture ?? 0}%  →  Projected below 60% by ${result.soilProjectedBy ?? '—'}`}
        />
      </LeftAccentBlock>
    );
  }

  return (
    <LeftAccentBlock accent="red">
      <div className="label-caps" style={{ marginBottom: 4 }}>NO CLEAR WINDOW IN FORECAST</div>
      <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '8px 0' }} />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>
        Conditions do not support harvest in the next 10 days. Monitor daily.
      </p>
    </LeftAccentBlock>
  );
}
