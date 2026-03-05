import type { StatusColor } from '../../constants';

interface StatusBadgeProps {
  status: StatusColor;
  label: string;
}

const statusStyles: Record<StatusColor, React.CSSProperties> = {
  green: {
    color: 'var(--green)',
    borderColor: 'var(--green)',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  amber: {
    color: 'var(--amber)',
    borderColor: 'var(--amber)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  red: {
    color: 'var(--red)',
    borderColor: 'var(--red)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusStyles[status];
  return (
    <span
      style={{
        ...style,
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 700,
        padding: '4px 10px',
        borderRadius: 9999,
        border: '1px solid',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
}
