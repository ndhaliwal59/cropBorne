import { useState } from 'react';
import { LabeledDataRow } from '../ui/LabeledDataRow';
import { LeftAccentBlock } from '../ui/LeftAccentBlock';
import type { FieldState } from '../../types';
import type { DiseasePanelState } from '../../diseaseLogic';
import './DiseasePanel.css';

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
    <div className="diseasePanel__root">
      <div>
        <div className="diseasePanel__title">{title}</div>
        <div className="diseasePanel__subtitle">{subtitle}</div>
      </div>

      <div className="diseasePanel__badgeWrap">
        {state.severity === 'NO_ALERT' && (
          <span className="diseasePanel__badge" data-severity="none">MONITORING</span>
        )}
        {state.severity === 'WATCH' && (
          <span className="diseasePanel__badge" data-severity="watch">WATCH</span>
        )}
        {state.severity === 'WARNING' && (
          <span className="diseasePanel__badge" data-severity="warning">WARNING</span>
        )}
      </div>

      {(isWatch || isWarning) && (
        <LeftAccentBlock accent={isWarning ? 'red' : 'amber'}>
          {state.riskBeginsInHours != null && (
            <LabeledDataRow label="Risk begins in" value={`${state.riskBeginsInHours} hrs`} />
          )}
          {state.sustainedHours != null && (
            <LabeledDataRow label="Sustained for" value={`${state.sustainedHours} hrs`} />
          )}
          {state.message && <p className="diseasePanel__message">{state.message}</p>}
          {state.actionLine && (
            <div className="diseasePanel__action" data-severity={isWarning ? 'warning' : 'watch'}>
              {state.actionLine}
            </div>
          )}
        </LeftAccentBlock>
      )}

      {!hasAlert && (
        <button
          type="button"
          onClick={() => setShowConditions((v) => !v)}
          className="diseasePanel__toggle"
        >
          {showConditions ? 'Hide conditions' : 'Show conditions'}
        </button>
      )}

      {conditionsExpanded && (
        <div className="diseasePanel__conditions">
          <LabeledDataRow label="Leaf wetness" value={`${fieldState.leafWetness} / 10`} />
          <LabeledDataRow label="24hr rain" value={`${fieldState.rain24h} mm`} />
          <LabeledDataRow label="Days since rain" value={String(fieldState.daysSinceRain)} />
        </div>
      )}

      {dedupeNote && conditionsExpanded && (
        <div className="diseasePanel__dedupe">{dedupeNote}</div>
      )}
    </div>
  );
}
