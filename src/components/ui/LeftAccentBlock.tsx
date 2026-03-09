import type { ReactNode } from 'react';
import type { StatusColor } from '../../constants';
import './LeftAccentBlock.css';

interface LeftAccentBlockProps {
  accent: StatusColor;
  children: ReactNode;
  className?: string;
}

export function LeftAccentBlock({ accent, children, className = '' }: LeftAccentBlockProps) {
  return (
    <div
      className={`leftAccentBlock ${className}`.trim()}
      data-accent={accent}
    >
      {children}
    </div>
  );
}
