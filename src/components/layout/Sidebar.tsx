import { SidebarWordmark } from '../sidebar/SidebarWordmark';
import { SidebarCropConditions } from '../sidebar/SidebarCropConditions';
import { SidebarDiseaseMonitoring } from '../sidebar/SidebarDiseaseMonitoring';
import { SidebarFooter } from '../sidebar/SidebarFooter';
import { getPowderyMildewState, getDownyMildewState } from '../../diseaseLogic';
import type { PairedHour } from '../../types';

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
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--surface1)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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
        />
      )}
      <SidebarFooter isCached={isCached} cachedTimestamp={cachedTimestamp} />
    </aside>
  );
}
