import type { ReactNode } from 'react';

interface LabeledDataRowProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

export function LabeledDataRow({ label, value, valueClassName = 'value-mono' }: LabeledDataRowProps) {
  return (
    <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  }}>
      <span className="label-caps">{label}</span>
      <span className={valueClassName} style={{ fontSize: '14px', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
