import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FieldState, WeatherHour } from '../../types';
import type { DiseasePanelState } from '../../diseaseLogic';
import { THRESHOLDS } from '../../constants';
import './SidebarDiseaseMonitoring.css';

type DiseaseKey = 'powdery' | 'downy';

const DISEASES: {
  key: DiseaseKey;
  name: string;
}[] = [
  {
    key: 'powdery',
    name: 'POWDERY MILDEW',
  },
  {
    key: 'downy',
    name: 'DOWNY MILDEW',
  },
];

interface SidebarDiseaseMonitoringProps {
  powderyState: DiseasePanelState;
  downyState: DiseasePanelState;
  fieldState: FieldState;
  weatherHour?: WeatherHour;
  embedded?: boolean;
}

function TooltipContent({
  diseaseKey,
  name,
  state,
  fieldState,
  weatherHour,
}: {
  diseaseKey: DiseaseKey;
  name: string;
  state: DiseasePanelState;
  fieldState: FieldState;
  weatherHour?: WeatherHour;
}) {
  const isInactive = state.severity === 'NO_ALERT';
  const isWarning = state.severity === 'WARNING';

  return (
    <div className="sidebarDiseaseMonitoring__tooltipCol">
      <div>
        <div className="sidebarDiseaseMonitoring__tooltipTitle">{name}</div>
      </div>

      <div className="sidebarDiseaseMonitoring__tooltipTags">
        {isInactive ? (
          <span className="sidebarDiseaseMonitoring__tooltipTag">MONITORING</span>
        ) : (
          <span
            className={`sidebarDiseaseMonitoring__tooltipTag ${isWarning ? 'sidebarDiseaseMonitoring__tooltipTagAlert' : 'sidebarDiseaseMonitoring__tooltipTagWarning'}`}
          >
            {state.severity === 'WARNING' ? '⚠ WARNING' : '⚠ WATCH'}
          </span>
        )}
      </div>

      {!isInactive && (
        <>
          {state.riskBeginsInHours != null && (
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">RISK BEGINS IN</span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{state.riskBeginsInHours} hrs</span>
            </div>
          )}
          {state.sustainedHours != null && (
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">
                {diseaseKey === 'downy' ? 'SUSTAINED WET' : 'SUSTAINED HIGH RH'}
              </span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{state.sustainedHours} hrs</span>
            </div>
          )}
          {state.message && (
            <p className="sidebarDiseaseMonitoring__tooltipPara">{state.message}</p>
          )}
          {state.actionLine && (
            <div
              className="sidebarDiseaseMonitoring__tooltipAction"
              data-severity={isWarning ? 'warning' : 'watch'}
            >
              {state.actionLine}
            </div>
          )}
        </>
      )}

      <div className="sidebarDiseaseMonitoring__tooltipMeta">
        {diseaseKey === 'downy' ? (
          <>
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">LEAF WETNESS</span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{fieldState.leafWetness} / 10</span>
            </div>
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">SUSTAINED WET HRS</span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{state.sustainedHours ?? 0} / {THRESHOLDS.disease.downy.sustainedHoursWarning}</span>
            </div>
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">24HR RAIN</span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{fieldState.rain24h} mm</span>
            </div>
            <div className="sidebarDiseaseMonitoring__tooltipRow">
              <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">DAYS SINCE RAIN</span>
              <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{fieldState.daysSinceRain}</span>
            </div>
          </>
        ) : (
          <>
            {weatherHour && (
              <>
                <div className="sidebarDiseaseMonitoring__tooltipRow">
                  <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">HUMIDITY</span>
                  <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{weatherHour.relative_humidity_2m} / {THRESHOLDS.disease.powdery.humidityMinPercent}%</span>
                </div>
                <div className="sidebarDiseaseMonitoring__tooltipRow">
                  <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">TEMP</span>
                  <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{Math.round(weatherHour.temperature_2m)} / {THRESHOLDS.disease.powdery.tempMaxF}°F</span>
                </div>
                <div className="sidebarDiseaseMonitoring__tooltipRow">
                  <span className="label-caps sidebarDiseaseMonitoring__tooltipTag">SUSTAINED HIGH RH HRS</span>
                  <span className="value-mono sidebarDiseaseMonitoring__tooltipValue">{state.sustainedHours ?? 0} / {THRESHOLDS.disease.powdery.sustainedHoursWarning}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SidebarDiseaseMonitoring({
  powderyState,
  downyState,
  fieldState,
  weatherHour,
  embedded = false,
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
      top: rect.top - 20,
      left: sidebarWidth + 8,
    });
  }, [hoveredKey]);

  const hoveredDisease = hoveredKey ? DISEASES.find((d) => d.key === hoveredKey) : null;
  const hoveredState = hoveredKey ? states[hoveredKey] : null;

  const rows = (
    <div className="sidebarDiseaseMonitoring__rows">
      {DISEASES.map(({ key, name }) => {
        const state = states[key];
        const isInactive = state.severity === 'NO_ALERT';
        const isWarning = state.severity === 'WARNING';
        const iconState = isInactive ? 'inactive' : isWarning ? 'warning' : 'watch';

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
            className="sidebarDiseaseMonitoring__row"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setHovered(hoveredKey === key ? null : key);
              }
            }}
          >
            <div className="sidebarDiseaseMonitoring__rowInner">
              <span
                className="sidebarDiseaseMonitoring__icon"
                data-state={iconState}
                aria-hidden
              >
                &#x26A0;
              </span>
              <span
                className="sidebarDiseaseMonitoring__name"
                data-state={iconState}
              >
                {name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {embedded ? (
        rows
      ) : (
        <div className="sidebarDiseaseMonitoring__section">
          <div className="label-caps sidebarDiseaseMonitoring__label">
            DISEASE MONITORING
          </div>
          {rows}
        </div>
      )}

      {hoveredDisease && hoveredState !== null && tooltipRect &&
        createPortal(
          <div
            className="sidebarDiseaseMonitoring__tooltip"
            style={{ top: tooltipRect.top, left: tooltipRect.left }}
            onMouseEnter={() => hoveredKey && setHovered(hoveredKey)}
            onMouseLeave={() => setHovered(null)}
          >
            <TooltipContent
              diseaseKey={hoveredDisease.key}
              name={hoveredDisease.name}
              state={hoveredState}
              fieldState={fieldState}
              weatherHour={weatherHour}
            />
          </div>,
          document.body
        )}
    </>
  );
}
