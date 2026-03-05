import type { ReactNode } from 'react';
import type { StatusColor } from '../../constants';

interface LeftAccentBlockProps {
  accent: StatusColor;
  children: ReactNode;
  className?: string;
}

const accentColor: Record<StatusColor, string> = {
  green: 'var(--green)',
  amber: 'var(--amber)',
  red: 'var(--red)',
};

export function LeftAccentBlock({ accent, children, className = '' }: LeftAccentBlockProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--surface2)',
        borderLeft: `4px solid ${accentColor[accent]}`,
        padding: '16px 20px',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {children}
    </div>
  );
}
