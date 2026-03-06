export const SECTION_IDS = ['harvest', 'spray'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  spray: 'SPRAY',
  harvest: 'HARVEST',
};
