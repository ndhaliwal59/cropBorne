import type { ReactNode } from 'react';
import './LabeledDataRow.css';

interface LabeledDataRowProps {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

export function LabeledDataRow({ label, value, valueClassName = 'value-mono' }: LabeledDataRowProps) {
  return (
    <div className="labeledDataRow">
      <span className="label-caps">{label}</span>
      <span className={`${valueClassName} labeledDataRow__value`}>{value}</span>
    </div>
  );
}
