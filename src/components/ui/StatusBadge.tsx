import type { StatusColor } from '../../constants';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: StatusColor;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className="statusBadge" data-status={status}>
      {label}
    </span>
  );
}
