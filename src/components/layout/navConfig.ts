export const SECTION_IDS = ['harvest', 'spray'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  spray: 'SPRAY',
  harvest: 'HARVEST',
};

export const INSIGHTS_ROUTE = '/';
export const INSIGHTS_LABEL = 'INSIGHTS';

export const WEATHER_ROUTE = '/weather';
export const WEATHER_LABEL = 'WEATHER';
