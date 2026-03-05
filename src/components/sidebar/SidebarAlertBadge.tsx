import { LeftAccentBlock } from '../ui/LeftAccentBlock';

interface SidebarAlertBadgeProps {
  diseaseName: string;
  severity: string;
  onScrollToDisease: () => void;
}

export function SidebarAlertBadge({
  diseaseName,
  severity,
  onScrollToDisease,
}: SidebarAlertBadgeProps) {
  return (
    <button
      type="button"
      onClick={onScrollToDisease}
      style={{
        width: '100%',
        textAlign: 'left',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <LeftAccentBlock accent="red">
        <div className="label-caps" style={{ color: 'var(--red)', marginBottom: 4 }}>
          Disease alert
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-primary)' }}>
          {diseaseName} · {severity}
        </div>
      </LeftAccentBlock>
    </button>
  );
}
