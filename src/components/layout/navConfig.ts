export const SECTION_IDS = ['harvest', 'spray'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const INSIGHTS_ROUTE = '/';
export const INSIGHTS_LABEL = 'INSIGHTS';

export const WEATHER_ROUTE = '/weather';
export const WEATHER_LABEL = 'WEATHER';
