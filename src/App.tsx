import { useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { SECTION_IDS, type SectionId } from './components/layout/navConfig';
import { useSectionObserver } from './components/layout/TopNav';
import { usePairedData } from './usePairedData';
import { SpraySection } from './components/spray/SpraySection';
import { HeatSection } from './components/heat/HeatSection';
import { HarvestSection } from './components/harvest/HarvestSection';
import { SectionDivider } from './components/ui/SectionDivider';
import { getSpraySectionStatus } from './sectionStatus/spray';
import { getHeatSectionStatus } from './sectionStatus/heat';
import { getHarvestSectionStatus } from './sectionStatus/harvest';
import type { StatusColor } from './constants';

function App() {
  const { paired, nowIndex } = usePairedData();
  const activeSection = useSectionObserver(SECTION_IDS);

  const sectionStatus: Record<SectionId, StatusColor | null> = {
    spray: getSpraySectionStatus(paired, nowIndex),
    heat: getHeatSectionStatus(paired, nowIndex),
    harvest: getHarvestSectionStatus(paired, nowIndex),
  };

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (paired.length === 0) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
        Loading…
      </div>
    );
  }

  return (
    <MainLayout
      sidebar={
        <Sidebar
          paired={paired}
          nowIndex={nowIndex}
        />
      }
      mainContent={
        <>
          <HeatSection paired={paired} nowIndex={nowIndex} />
          <SectionDivider />
          <SpraySection paired={paired} nowIndex={nowIndex} />
          <SectionDivider />
          <HarvestSection paired={paired} nowIndex={nowIndex} />
        </>
      }
      activeSection={activeSection}
      sectionStatus={sectionStatus}
      onNavigate={scrollToSection}
    />
  );
}

export default App;
