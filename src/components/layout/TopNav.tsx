import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  INSIGHTS_LABEL,
  INSIGHTS_ROUTE,
  WEATHER_LABEL,
  WEATHER_ROUTE,
  type SectionId,
} from './navConfig';
import type { StatusColor } from '../../constants';
import './TopNav.css';

interface TopNavProps {
  activeSection: SectionId | null;
  sectionStatus: Record<SectionId, StatusColor | null>;
  onNavigate: (id: SectionId) => void;
}

export function TopNav({ activeSection: _activeSection, sectionStatus: _sectionStatus, onNavigate: _onNavigate }: TopNavProps) {
  const location = useLocation();
  const isWeatherPage = location.pathname === WEATHER_ROUTE;
  const isInsightsPage = location.pathname === INSIGHTS_ROUTE;
  const isInsightsActive = isInsightsPage;

  return (
    <nav
      className="topNav__nav"
      data-weather-page={isWeatherPage}
    >
      {isWeatherPage ? (
        <>
          <div className="topNav__brand">
            <div className="topNav__wordmark">CROPBORNE</div>
            <div className="topNav__brandDivider" />
            <div className="topNav__subtitle">Sandoval Vineyard · Fresno, CA</div>
          </div>

          <div className="topNav__links">
            <Link
              to={INSIGHTS_ROUTE}
              className="topNav__link topNav__linkWeather"
            >
              ← DASHBOARD
            </Link>
            <Link
              to={WEATHER_ROUTE}
              className="topNav__link topNav__linkWeatherActive"
            >
              {WEATHER_LABEL}
            </Link>
          </div>
        </>
      ) : (
        <>
          <Link
            to={INSIGHTS_ROUTE}
            className="topNav__link topNav__linkInsightsMargin"
            data-active={isInsightsActive}
          >
            {INSIGHTS_LABEL}
          </Link>
          <Link
            to={WEATHER_ROUTE}
            className="topNav__link"
            data-active={isWeatherPage}
          >
            {WEATHER_LABEL}
          </Link>
        </>
      )}
    </nav>
  );
}

export function useSectionObserver(sectionIds: readonly SectionId[]) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  useEffect(() => {
    const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id as SectionId;
          if (sectionIds.includes(id)) setActiveSection(id);
          break;
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    elements.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds.join(',')]);

  return activeSection;
}
