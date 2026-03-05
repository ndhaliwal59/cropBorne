import type { ForecastResponse, WeatherHour, FieldState, PairedHour } from './types';
import { celsiusToFahrenheit, kmhToMph, windDirectionFromDegrees } from './types';

const SEED = {
  daysSinceRain: 5,
  soilMoisture: 30,
  leafWetness: 0,
} as const;

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    console.warn(`Field state out of bounds: ${value} clamped to ${min}`);
    return min;
  }
  if (value > max) {
    console.warn(`Field state out of bounds: ${value} clamped to ${max}`);
    return max;
  }
  return value;
}

function sliceWeatherHour(
  forecast: ForecastResponse,
  i: number
): Omit<WeatherHour, 'cloudcover'> & { cloudcover: number } {
  const h = forecast.hourly;
  return {
    time: h.time[i],
    temperature_2m: celsiusToFahrenheit(h.temperature_2m[i]),
    relative_humidity_2m: h.relative_humidity_2m[i],
    precipitation_probability: h.precipitation_probability[i],
    weathercode: h.weathercode[i],
    windspeed_10m: kmhToMph(h.windspeed_10m[i]),
    winddirection_10m: h.winddirection_10m[i],
    precipitation: h.precipitation[i],
    cloudcover: h.cloudcover?.[i] ?? 50,
  };
}

/**
 * Walks the hourly array chronologically and produces paired { weatherHour, fieldState }.
 * WeatherHour uses °F and mph. Field state is updated each hour (rain, dry streak, leaf wetness, soil).
 */
export function runFieldStateEngine(forecast: ForecastResponse): PairedHour[] {
  const result: PairedHour[] = [];
  const h = forecast.hourly;
  const n = h.time.length;

  let daysSinceRain: number = SEED.daysSinceRain;
  let soilMoisture: number = SEED.soilMoisture;
  let leafWetness: number = SEED.leafWetness;
  let dryStreakHours: number = daysSinceRain * 24;
  const rain24hWindow: { time: number; mm: number }[] = [];

  for (let i = 0; i < n; i++) {
    const precipMm = h.precipitation[i];
    const isRain = precipMm > 0;
    const ts = new Date(h.time[i]).getTime();

    if (isRain) {
      dryStreakHours = 0;
      daysSinceRain = 0;
      leafWetness = Math.min(10, leafWetness + 2);
      soilMoisture = Math.min(100, soilMoisture + Math.min(15, precipMm * 3));
    } else {
      dryStreakHours += 1;
      if (i > 0 && new Date(h.time[i]).getDate() !== new Date(h.time[i - 1]).getDate()) {
        daysSinceRain += 1;
      }
      leafWetness = Math.max(0, leafWetness - 0.3);
      soilMoisture = Math.max(0, soilMoisture - 0.2);
    }

    rain24hWindow.push({ time: ts, mm: precipMm });
    const cutoff24h = ts - 24 * 60 * 60 * 1000;
    while (rain24hWindow.length > 0 && rain24hWindow[0].time < cutoff24h) {
      rain24hWindow.shift();
    }
    const rain24h = rain24hWindow.reduce((s, r) => s + r.mm, 0);

    soilMoisture = clamp(soilMoisture, 0, 100);
    leafWetness = clamp(Math.round(leafWetness * 10) / 10, 0, 10);

    const weatherHour: WeatherHour = sliceWeatherHour(forecast, i);
    const fieldState: FieldState = {
      soilMoisture: Math.round(soilMoisture * 10) / 10,
      leafWetness: Math.round(leafWetness * 10) / 10,
      rain24h: Math.round(rain24h * 10) / 10,
      dryStreakHours,
      daysSinceRain,
    };

    result.push({ weatherHour, fieldState });
  }

  return result;
}

export { windDirectionFromDegrees };
