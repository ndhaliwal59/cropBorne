export const SECTION_IDS = ['heat', 'spray', 'harvest'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  heat: 'HEAT & LABOR',
  spray: 'SPRAY',
  harvest: 'HARVEST',
};
