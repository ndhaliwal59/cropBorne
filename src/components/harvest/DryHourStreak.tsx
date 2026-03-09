import { LabeledDataRow } from '../ui/LabeledDataRow';
import { THRESHOLDS } from '../../constants';
import './DryHourStreak.css';

interface DryHourStreakProps {
  dryStreakHours: number;
}

export function DryHourStreak({ dryStreakHours }: DryHourStreakProps) {
  const required = THRESHOLDS.harvest.dryStreakHoursRequired;
  return (
    <div className="dryHourStreak__root">
      <LabeledDataRow
        label="EFFECTIVE DRY-HOUR STREAK"
        value={`${dryStreakHours} hrs / ${required} required`}
      />
      <p className="dryHourStreak__note">
        Anchored to last rain event · Forecast alone cannot reset the streak.
      </p>
    </div>
  );
}
