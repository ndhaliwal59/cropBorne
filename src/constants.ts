/**
 * Single source of truth for all numerical thresholds.
 * Every magic number in the app references this object.
 */
export const THRESHOLDS = {
  spray: {
    windMinMph: 3,
    windMaxMph: 10,
    humidityMaxPercent: 85,
    inversionWindMaxMph: 3,
    soilSaturationMaxPercent: 70,
    minConsecutiveHours: 3,
  },
  heat: {
    provisionsTempF: 80,
    highHeatTempF: 95,
  },
  disease: {
    lookaheadHours: 48,
    /** Downy mildew: driven by leaf wetness (free moisture on foliage) */
    downy: {
      leafWetnessWatch: 5,
      leafWetnessWarning: 7,
      sustainedHoursWatch: 4,
      sustainedHoursWarning: 6,
    },
    /** Powdery mildew: driven by high humidity (can develop without free moisture) */
    powdery: {
      humidityMinPercent: 85,
      tempMinF: 59,
      tempMaxF: 86,
      sustainedHoursWatch: 4,
      sustainedHoursWarning: 6,
    },
  },
  harvest: {
    dryStreakHoursRequired: 48,
    soilEntryMaxPercent: 60,
    soilSaturationTrafficabilityPercent: 75,
  },
  conditionBar: {
    temp: {
      frostRiskBelowF: 40,
      coolMinF: 40,
      coolMaxF: 59,
      optimalMinF: 60,
      optimalMaxF: 85,
      elevatedMinF: 86,
      elevatedMaxF: 95,
      heatStressAboveF: 95,
    },
    soilWater: {
      droughtMaxPercent: 15,
      dryMinPercent: 15,
      dryMaxPercent: 30,
      optimalMinPercent: 30,
      optimalMaxPercent: 70,
      saturatedMinPercent: 70,
      saturatedMaxPercent: 85,
      waterloggedMinPercent: 85,
    },
    cloudCover: {
      fullSunMaxPercent: 20,
      partialMaxPercent: 50,
    },
    wind: {
      stillMaxMph: 3,
      optimalMinMph: 3,
      optimalMaxMph: 10,
      elevatedMinMph: 10,
      elevatedMaxMph: 15,
      highAboveMph: 15,
    },
  },
  botrytis: {
    lowRainProbMax: 20,
    marginalRainProbMax: 50,
  },
} as const;

export type StatusColor = 'green' | 'amber' | 'red';
