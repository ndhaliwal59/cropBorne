import { LeftAccentBlock } from '../ui/LeftAccentBlock';
import './SidebarAlertBadge.css';

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
      className="sidebarAlertBadge__button"
    >
      <LeftAccentBlock accent="red">
        <div className="label-caps sidebarAlertBadge__label">Disease alert</div>
        <div className="sidebarAlertBadge__text">
          {diseaseName} · {severity}
        </div>
      </LeftAccentBlock>
    </button>
  );
}
