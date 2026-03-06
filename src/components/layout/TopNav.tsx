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

interface TopNavProps {
  activeSection: SectionId | null;
  sectionStatus: Record<SectionId, StatusColor | null>;
  onNavigate: (id: SectionId) => void;
}

const navButtonStyle = {
  fontFamily: 'var(--font-sans)' as const,
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.02em',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer' as const,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  marginBottom: -1,
  textDecoration: 'none',
};

export function TopNav({ activeSection, sectionStatus, onNavigate }: TopNavProps) {
  const location = useLocation();
  const isWeatherPage = location.pathname === WEATHER_ROUTE;
  const isInsightsPage = location.pathname === INSIGHTS_ROUTE;
  const isInsightsActive = isInsightsPage;

  return (
    <nav
      style={{
        height: 'var(--nav-height)',
        minHeight: 'var(--nav-height)',
        backgroundColor: 'var(--surface1)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        paddingRight: 'var(--main-padding-x)',
        paddingLeft: isWeatherPage ? 'var(--main-padding-x)' : 0,
        gap: 24,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {isWeatherPage ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: '#ffffff',
              }}
            >
              CROPBORNE
            </div>
            <div style={{ width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>
              Sandoval Vineyard · Fresno, CA
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 22, height: '100%' }}>
            <Link
              to={INSIGHTS_ROUTE}
              style={{
                ...navButtonStyle,
                color: 'rgba(255,255,255,0.35)',
                borderBottom: '2px solid transparent',
              }}
            >
              ← DASHBOARD
            </Link>
            <Link
              to={WEATHER_ROUTE}
              style={{
                ...navButtonStyle,
                color: '#ffffff',
                borderBottom: '2px solid #ffffff',
              }}
            >
              {WEATHER_LABEL}
            </Link>
          </div>
        </>
      ) : (
        <>
          <Link
            to={INSIGHTS_ROUTE}
            style={{
              ...navButtonStyle,
              marginLeft: 'auto',
              color: isInsightsActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: isInsightsActive ? '2px solid var(--border-active)' : '2px solid transparent',
            }}
          >
            {INSIGHTS_LABEL}
          </Link>
          <Link
            to={WEATHER_ROUTE}
            style={{
              ...navButtonStyle,
              color: isWeatherPage ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: isWeatherPage ? '2px solid var(--border-active)' : '2px solid transparent',
            }}
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
