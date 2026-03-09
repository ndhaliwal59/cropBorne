import { useCallback } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar } from './components/layout/Sidebar';
import { SECTION_IDS, type SectionId } from './components/layout/navConfig';
import { useSectionObserver } from './components/layout/TopNav';
import { useWeatherForecast } from './useWeatherForecast';
import { SpraySection } from './components/spray/SpraySection';
import { HarvestSection } from './components/harvest/HarvestSection';
import { SectionDivider } from './components/ui/SectionDivider';
import { getSpraySectionStatus } from './sectionStatus/spray';
import { getHarvestSectionStatus } from './sectionStatus/harvest';
import type { StatusColor } from './constants';
import './App.css';

function formatCachedTimestamp(cachedAt: number | null): string | undefined {
  if (cachedAt == null) {
    return undefined;
  }

  return new Date(cachedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function App() {
  const { paired, nowIndex, isLoading, isLive, cachedAt } = useWeatherForecast();
  const activeSection = useSectionObserver(SECTION_IDS);
  const cachedTimestamp = formatCachedTimestamp(cachedAt);

  const sectionStatus: Record<SectionId, StatusColor | null> = {
    spray: getSpraySectionStatus(paired, nowIndex),
    harvest: getHarvestSectionStatus(paired, nowIndex),
  };

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (isLoading || paired.length === 0) {
    return (
      <div className="appLoading">
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
          isCached={!isLive}
          cachedTimestamp={cachedTimestamp}
        />
      }
      mainContent={
        <>
          <HarvestSection paired={paired} nowIndex={nowIndex} />
          <SectionDivider />
          <SpraySection paired={paired} nowIndex={nowIndex} />
        </>
      }
      activeSection={activeSection}
      sectionStatus={sectionStatus}
      onNavigate={scrollToSection}
      dataUnavailable={!isLive}
      cachedTimestamp={cachedTimestamp}
    />
  );
}

export default App;
