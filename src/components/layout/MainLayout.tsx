import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import type { SectionId } from './navConfig';
import type { StatusColor } from '../../constants';

interface MainLayoutProps {
  sidebar: ReactNode;
  mainContent: ReactNode;
  activeSection: SectionId | null;
  sectionStatus: Record<SectionId, StatusColor | null>;
  onNavigate: (id: SectionId) => void;
  /** When true, show amber banner (API failure / cached data) */
  dataUnavailable?: boolean;
  cachedTimestamp?: string;
}

export function MainLayout({
  sidebar,
  mainContent,
  activeSection,
  sectionStatus,
  onNavigate,
  dataUnavailable = false,
  cachedTimestamp,
}: MainLayoutProps) {
  return (
    <>
      {sidebar}
      <div
        style={{
          marginLeft: 'var(--sidebar-width)',
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
