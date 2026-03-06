import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import type { SectionId } from './navConfig';
import type { StatusColor } from '../../constants';

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
        style={{
          marginLeft: hasSidebar ? 'var(--sidebar-width)' : 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {dataUnavailable && (
          <div
            style={{
              padding: '10px var(--main-padding-x)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderBottom: '1px solid var(--amber)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--amber)',
            }}
          >
            ⚠ Weather data unavailable — displaying cached data from {cachedTimestamp ?? 'unknown'}.
          </div>
        )}
        <TopNav
          activeSection={activeSection}
          sectionStatus={sectionStatus}
          onNavigate={onNavigate}
        />
        <main
          style={{
            flex: 1,
            padding: `0 var(--main-padding-x)`,
            maxWidth: 'var(--main-max-width)',
            width: '100%',
            margin: '0 auto',
            overflowY: 'auto',
          }}
        >
          {mainContent}
        </main>
      </div>
    </>
  );
}
