import { useEffect, useState } from 'react';
import { SECTION_IDS, SECTION_LABELS, type SectionId } from './navConfig';
import type { StatusColor } from '../../constants';

interface TopNavProps {
  activeSection: SectionId | null;
  sectionStatus: Record<SectionId, StatusColor | null>;
  onNavigate: (id: SectionId) => void;
}

export function TopNav({ activeSection, sectionStatus, onNavigate }: TopNavProps) {
  return (
    <nav
      style={{
        height: 'var(--nav-height)',
        minHeight: 'var(--nav-height)',
        backgroundColor: 'var(--surface1)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 'var(--main-padding-x)',
        gap: 24,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {SECTION_IDS.map((id) => {
        const isActive = activeSection === id;
        const status = sectionStatus[id];
        const underlineColor =
          status === 'red'
            ? 'var(--red)'
            : status === 'amber'
              ? 'var(--amber)'
              : 'var(--border-active)';
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              borderBottom: isActive ? `2px solid ${underlineColor}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {SECTION_LABELS[id]}
          </button>
        );
      })}
    </nav>
  );
}

export function useSectionObserver(sectionIds: readonly SectionId[]) {
  const [activeSection, setActiveSection] = useState<SectionId | null>(sectionIds[0] ?? null);

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
