import { LabeledDataRow } from '../ui/LabeledDataRow';
import { THRESHOLDS } from '../../constants';

interface DryHourStreakProps {
  dryStreakHours: number;
}

export function DryHourStreak({ dryStreakHours }: DryHourStreakProps) {
  const required = THRESHOLDS.harvest.dryStreakHoursRequired;
  return (
    <div
      style={{
        backgroundColor: 'var(--surface2)',
        padding: 16,
        borderRadius: 'var(--radius-sm)',
        marginTop: 16,
      }}
    >
      <LabeledDataRow
        label="EFFECTIVE DRY-HOUR STREAK"
        value={`${dryStreakHours} hrs / ${required} required`}
      />
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          margin: '8px 0 0',
        }}
      >
        Anchored to last rain event · Forecast alone cannot reset the streak.
      </p>
    </div>
  );
}
