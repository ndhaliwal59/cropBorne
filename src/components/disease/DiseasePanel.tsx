import { useState } from 'react';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import { LeftAccentBlock } from '../ui/LeftAccentBlock';
import type { FieldState } from '../../types';
import type { DiseasePanelState } from '../../diseaseLogic';

interface DiseasePanelProps {
  title: string;
  subtitle: string;
  state: DiseasePanelState;
  fieldState: FieldState;
  dedupeNote?: string;
}

export function DiseasePanel({
  title,
  subtitle,
  state,
  fieldState,
  dedupeNote,
}: DiseasePanelProps) {
  const [showConditions, setShowConditions] = useState(false);
  const isWarning = state.severity === 'WARNING';
  const isWatch = state.severity === 'WATCH';
  const hasAlert = isWatch || isWarning;
  const conditionsExpanded = hasAlert || showConditions;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: 'var(--surface1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            marginTop: 4,
            marginBottom: 14,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {state.severity === 'NO_ALERT' && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--text-tertiary)',
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid var(--border)',
            }}
          >
            MONITORING
          </span>
        )}
        {state.severity === 'WATCH' && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--amber)',
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid var(--amber)',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
            }}
          >
            WATCH
          </span>
        )}
        {state.severity === 'WARNING' && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--red)',
              padding: '6px 14px',
              borderRadius: 9999,
              border: '1px solid var(--red)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              animation: 'pulse-border 1.5s ease-in-out infinite',
            }}
          >
            WARNING
          </span>
        )}
      </div>

      {(isWatch || isWarning) && (
        <LeftAccentBlock
          accent={isWarning ? 'red' : 'amber'}
        >
          {state.riskBeginsInHours != null && (
            <LabeledDataRow
              label="Risk begins in"
              value={`${state.riskBeginsInHours} hrs`}
            />
          )}
          {state.sustainedHours != null && (
            <LabeledDataRow label="Sustained for" value={`${state.sustainedHours} hrs`} />
          )}
          {state.message && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--text-primary)',
                margin: '8px 0 0',
              }}
            >
              {state.message}
            </p>
          )}
          {state.actionLine && (
            <div
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                color: isWarning ? 'var(--red)' : 'var(--amber)',
                marginTop: 8,
              }}
            >
              {state.actionLine}
            </div>
          )}
        </LeftAccentBlock>
      )}

      {!hasAlert && (
        <button
          type="button"
          onClick={() => setShowConditions((v) => !v)}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
            textDecoration: 'underline',
          }}
        >
          {showConditions ? 'Hide conditions' : 'Show conditions'}
        </button>
      )}

      {conditionsExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LabeledDataRow label="Leaf wetness" value={`${fieldState.leafWetness} / 10`} />
          <LabeledDataRow label="24hr rain" value={`${fieldState.rain24h} mm`} />
          <LabeledDataRow label="Days since rain" value={String(fieldState.daysSinceRain)} />
        </div>
      )}

      {dedupeNote && conditionsExpanded && (
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
          }}
        >
          {dedupeNote}
        </div>
      )}
    </div>
  );
}
