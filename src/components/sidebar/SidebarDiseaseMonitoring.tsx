import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FieldState } from '../../types';
import type { DiseasePanelState } from '../../diseaseLogic';

type DiseaseKey = 'powdery' | 'downy';

const DISEASES: {
  key: DiseaseKey;
  name: string;
  subtitle: string;
}[] = [
  {
    key: 'powdery',
    name: 'POWDERY MILDEW',
    subtitle: 'Erysiphe necator · Warm, dry-wind cycles.',
  },
  {
    key: 'downy',
    name: 'DOWNY MILDEW',
    subtitle: 'Plasmopara viticola · Rain and leaf wetness.',
  },
];

interface SidebarDiseaseMonitoringProps {
  powderyState: DiseasePanelState;
  downyState: DiseasePanelState;
  fieldState: FieldState;
}

function TooltipContent({
  name,
  subtitle,
  state,
  fieldState,
}: {
  name: string;
  subtitle: string;
  state: DiseasePanelState;
  fieldState: FieldState;
}) {
  const isInactive = state.severity === 'NO_ALERT';
  const isWarning = state.severity === 'WARNING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
          {name}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {isInactive ? (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-tertiary)',
            }}
          >
            MONITORING
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: isWarning ? 'var(--red)' : 'var(--amber)',
            }}
          >
            {state.severity === 'WARNING' ? '⚠ WARNING' : '⚠ WATCH'}
          </span>
        )}
      </div>

      {!isInactive && (
        <>
          {state.riskBeginsInHours != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span className="label-caps" style={{ color: 'var(--text-tertiary)' }}>
                RISK BEGINS IN
              </span>
              <span className="value-mono" style={{ fontSize: 12, fontWeight: 500 }}>
                {state.riskBeginsInHours} hrs
              </span>
            </div>
          )}
          {state.sustainedHours != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
              <span className="label-caps" style={{ color: 'var(--text-tertiary)' }}>
                SUSTAINED FOR
              </span>
              <span className="value-mono" style={{ fontSize: 12, fontWeight: 500 }}>
                {state.sustainedHours} hrs
              </span>
            </div>
          )}
          {state.message && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-primary)', margin: 0 }}>
              {state.message}
            </p>
          )}
          {state.actionLine && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: isWarning ? 'var(--red)' : 'var(--amber)',
              }}
            >
              {state.actionLine}
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span className="label-caps" style={{ color: 'var(--text-tertiary)' }}>
            LEAF WETNESS
          </span>
          <span className="value-mono" style={{ fontSize: 12, fontWeight: 500 }}>
            {fieldState.leafWetness} / 10
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span className="label-caps" style={{ color: 'var(--text-tertiary)' }}>
            24HR RAIN
          </span>
          <span className="value-mono" style={{ fontSize: 12, fontWeight: 500 }}>
            {fieldState.rain24h} mm
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span className="label-caps" style={{ color: 'var(--text-tertiary)' }}>
            DAYS SINCE RAIN
          </span>
          <span className="value-mono" style={{ fontSize: 12, fontWeight: 500 }}>
            {fieldState.daysSinceRain}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SidebarDiseaseMonitoring({
  powderyState,
  downyState,
  fieldState,
}: SidebarDiseaseMonitoringProps) {
  const [hoveredKey, setHoveredKey] = useState<DiseaseKey | null>(null);
  const [tooltipRect, setTooltipRect] = useState<{ top: number; left: number } | null>(null);
  const rowRefs = useRef<Record<DiseaseKey, HTMLDivElement | null>>({ powdery: null, downy: null });
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const states: Record<DiseaseKey, DiseasePanelState> = { powdery: powderyState, downy: downyState };

  const setHovered = (key: DiseaseKey | null) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (key === null) {
      leaveTimeoutRef.current = setTimeout(() => setHoveredKey(null), 100);
    } else {
      setHoveredKey(key);
    }
  };

  useEffect(() => {
    if (hoveredKey === null) {
      setTooltipRect(null);
      return;
    }
    const rowEl = rowRefs.current[hoveredKey];
    if (!rowEl) return;
    const sidebarWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width').trim()) || 240;
    const rect = rowEl.getBoundingClientRect();
    setTooltipRect({
      top: rect.top,
      left: sidebarWidth + 8,
    });
  }, [hoveredKey]);

  const hoveredDisease = hoveredKey ? DISEASES.find((d) => d.key === hoveredKey) : null;
  const hoveredState = hoveredKey ? states[hoveredKey] : null;

  return (
    <>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div
          className="label-caps"
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--text-tertiary)',
            marginBottom: 12,
          }}
        >
          DISEASE MONITORING
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DISEASES.map(({ key, name }) => {
            const state = states[key];
            const isInactive = state.severity === 'NO_ALERT';
            const isWatch = state.severity === 'WATCH';
            const isWarning = state.severity === 'WARNING';

            return (
              <div
                key={key}
                ref={(el) => {
                  rowRefs.current[key] = el;
                }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 0',
                  cursor: 'default',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background-color 120ms ease',
                }}
                  onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setHovered(hoveredKey === key ? null : key);
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      lineHeight: 1,
                      opacity: isInactive ? 0.4 : 1,
                      color: isInactive ? 'var(--text-tertiary)' : isWarning ? 'var(--red)' : isWatch ? 'var(--amber)' : 'var(--text-tertiary)',
                      boxShadow: isWatch ? '0 0 8px rgba(245, 158, 11, 0.4)' : isWarning ? '0 0 8px rgba(239, 68, 68, 0.4)' : 'none',
                      animation: isWarning ? 'disease-icon-pulse 1.5s ease-in-out infinite' : undefined,
                      borderRadius: 2,
                    }}
                  >
                    &#x26A0;
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: isInactive ? 'var(--text-tertiary)' : isWarning ? 'var(--red)' : isWatch ? 'var(--amber)' : 'var(--text-tertiary)',
                    }}
                  >
                    {name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredDisease && hoveredState !== null && tooltipRect &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: tooltipRect.top,
              left: tooltipRect.left,
              width: 260,
              padding: 16,
              backgroundColor: 'var(--surface2)',
              border: '1px solid var(--border-active)',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 1000,
              animation: 'tooltip-fade-in 150ms ease-out',
            }}
            onMouseEnter={() => hoveredKey && setHovered(hoveredKey)}
            onMouseLeave={() => setHovered(null)}
          >
            <TooltipContent
              name={hoveredDisease.name}
              subtitle={hoveredDisease.subtitle}
              state={hoveredState}
              fieldState={fieldState}
            />
          </div>,
          document.body
        )}
    </>
  );
}
