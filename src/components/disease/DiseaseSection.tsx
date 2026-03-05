import type { PairedHour } from '../../types';
import { getPowderyMildewState, getDownyMildewState } from '../../diseaseLogic';
import { DiseasePanel } from './DiseasePanel';

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
    <section id="disease" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
        DISEASE CONDITIONS MONITORING
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Powdery mildew · Downy mildew · 48-hour lookahead
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
