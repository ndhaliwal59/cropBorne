import type { PairedHour } from '../../types';
import { getPowderyMildewState, getDownyMildewState } from '../../diseaseLogic';
import { DiseasePanel } from './DiseasePanel';
import './DiseaseSection.css';

interface DiseaseSectionProps {
  paired: PairedHour[];
  nowIndex: number;
}

export function DiseaseSection({ paired, nowIndex }: DiseaseSectionProps) {
  const powdery = getPowderyMildewState(paired, nowIndex);
  const downy = getDownyMildewState(paired, nowIndex);
  const fieldState = paired[nowIndex]?.fieldState;

  if (!fieldState) return null;

  return (
    <section id="disease" className="diseaseSection__section">
      <h2 className="diseaseSection__title">DISEASE CONDITIONS MONITORING</h2>
      <p className="diseaseSection__sub">
        Powdery mildew · Downy mildew · 48-hour lookahead
      </p>
      <div className="diseaseSection__grid">
        <DiseasePanel
          title="POWDERY MILDEW"
          subtitle="Erysiphe necator · Warm, dry-wind cycles."
          state={powdery}
          fieldState={fieldState}
        />
        <DiseasePanel
          title="DOWNY MILDEW"
          subtitle="Plasmopara viticola · Rain and leaf wetness."
          state={downy}
          fieldState={fieldState}
        />
      </div>
    </section>
  );
}
