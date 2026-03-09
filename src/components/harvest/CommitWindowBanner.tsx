import { LeftAccentBlock } from '../ui/LeftAccentBlock';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import type { CommitWindowResult } from '../../harvestLogic';
import './CommitWindowBanner.css';

interface CommitWindowBannerProps {
  result: CommitWindowResult;
  dryStreakHours?: number;
}

export function CommitWindowBanner({ result, dryStreakHours = 0 }: CommitWindowBannerProps) {
  if (result.state === 'WINDOW') {
    return (
      <LeftAccentBlock accent="green">
        <div className="commitWindowBanner__row">
          <span className="commitWindowBanner__main">
            ✓ Send crews {result.windowStartDate} · Dispatch by {result.dispatchByDate ?? '—'}
          </span>
          <span className="commitWindowBanner__streak">
            DRY STREAK {dryStreakHours} hrs ✓
          </span>
        </div>
      </LeftAccentBlock>
    );
  }

  if (result.state === 'RECOVERY') {
    return (
      <LeftAccentBlock accent="amber">
        <div className="label-caps commitWindowBanner__label">RECOVERY IN PROGRESS</div>
        <div className="commitWindowBanner__divider" />
        <LabeledDataRow label="EARLIEST VIABLE ENTRY" value={result.earliestViableEntry ?? '—'} />
        <div className="commitWindowBanner__divider" />
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
      <div className="label-caps commitWindowBanner__labelTight">NO CLEAR WINDOW IN FORECAST</div>
      <div className="commitWindowBanner__divider" />
      <p className="commitWindowBanner__para">
        Conditions do not support harvest in the next 10 days. Monitor daily.
      </p>
    </LeftAccentBlock>
  );
}
