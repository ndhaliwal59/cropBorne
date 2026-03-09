import { SidebarWordmark } from '../sidebar/SidebarWordmark';
import { SidebarCropConditions } from '../sidebar/SidebarCropConditions';
import { SidebarDiseaseMonitoring } from '../sidebar/SidebarDiseaseMonitoring';
import { SidebarHeatMonitoring } from '../sidebar/SidebarHeatMonitoring';
import { SidebarFooter } from '../sidebar/SidebarFooter';
import { getPowderyMildewState, getDownyMildewState } from '../../diseaseLogic';
import type { PairedHour } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  paired: PairedHour[];
  nowIndex: number;
  isCached?: boolean;
  cachedTimestamp?: string;
}

export function Sidebar({
  paired,
  nowIndex,
  isCached,
  cachedTimestamp,
}: SidebarProps) {
  const now = paired[nowIndex];
  const powderyState = getPowderyMildewState(paired, nowIndex);
  const downyState = getDownyMildewState(paired, nowIndex);
  return (
    <aside className="sidebar__aside">
      <SidebarWordmark />
      {now && (
        <SidebarCropConditions
          weather={now.weatherHour}
          fieldState={now.fieldState}
        />
      )}
      {now && (
        <SidebarDiseaseMonitoring
          powderyState={powderyState}
          downyState={downyState}
          fieldState={now.fieldState}
          weatherHour={now.weatherHour}
        />
      )}
      <SidebarHeatMonitoring paired={paired} nowIndex={nowIndex} />
      <SidebarFooter isCached={isCached} cachedTimestamp={cachedTimestamp} />
    </aside>
  );
}
