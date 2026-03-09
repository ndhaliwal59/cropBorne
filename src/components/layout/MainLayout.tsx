import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import type { SectionId } from './navConfig';
import type { StatusColor } from '../../constants';
import './MainLayout.css';

interface MainLayoutProps {
  /** Omit or pass null to render without a sidebar (e.g. Weather page) */
  sidebar?: ReactNode | null;
  mainContent: ReactNode;
  activeSection: SectionId | null;
  sectionStatus: Record<SectionId, StatusColor | null>;
  onNavigate: (id: SectionId) => void;
  /** When true, show amber banner (API failure / cached data) */
  dataUnavailable?: boolean;
  cachedTimestamp?: string;
}

export function MainLayout({
  sidebar = null,
  mainContent,
  activeSection,
  sectionStatus,
  onNavigate,
  dataUnavailable = false,
  cachedTimestamp,
}: MainLayoutProps) {
  const hasSidebar = sidebar != null;
  return (
    <>
      {sidebar}
      <div
        className="mainLayout__wrapper"
        data-has-sidebar={hasSidebar}
      >
        {dataUnavailable && (
          <div className="mainLayout__banner">
            ⚠ Weather data unavailable — displaying cached data from {cachedTimestamp ?? 'unknown'}.
          </div>
        )}
        <TopNav
          activeSection={activeSection}
          sectionStatus={sectionStatus}
          onNavigate={onNavigate}
        />
        <main className="mainLayout__main">
          {mainContent}
        </main>
      </div>
    </>
  );
}
