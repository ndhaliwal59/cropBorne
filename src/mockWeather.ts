import type { ForecastResponse } from './types';

/**
 * 240 hours (10 days) of hourly data in Open-Meteo shape.
 * Units: temperature_2m °C, windspeed_10m km/h, precipitation mm.
 * Seed aligns with 5 days since rain, soilMoisture 30, leafWetness 0 after engine run.
 */
function buildMockForecast(): ForecastResponse {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const time: string[] = [];
  const temperature_2m: number[] = [];
  const relative_humidity_2m: number[] = [];
  const precipitation_probability: number[] = [];
  const weathercode: number[] = [];
  const windspeed_10m: number[] = [];
  const winddirection_10m: number[] = [];
  const precipitation: number[] = [];
  const cloudcover: number[] = [];

  for (let i = 0; i < 240; i++) {
    const t = new Date(start.getTime() + i * 60 * 60 * 1000);
    time.push(t.toISOString().slice(0, 19));
    const hour = t.getHours();
    const dayIndex = Math.floor(i / 24);

    // Diurnal: cool at night, warm midday (roughly 50–90°F = 10–32°C)
    const baseTemp = 12 + 10 * Math.sin(((hour - 6) * Math.PI) / 12) + (dayIndex % 3) * 2;
    temperature_2m.push(Math.round(baseTemp * 10) / 10);

    // Humidity 45–75% typical
    relative_humidity_2m.push(50 + Math.sin((hour / 24) * Math.PI * 2) * 15 + (i % 7) * 2);

    // Rain prob: low most days, one wet period early to seed "days since rain"
    let rainProb = 10 + (i % 17);
    if (i >= 24 && i < 30) rainProb = 70;
    if (i === 28) rainProb = 90;
    precipitation_probability.push(rainProb);

    // WMO weathercode: 0 clear, 1-3 partly cloudy, 45 fog, 61-82 rain
    let code = hour < 8 || hour > 18 ? 0 : hour % 2 === 0 ? 1 : 2;
    if (i >= 26 && i <= 32) code = i === 28 ? 80 : 61;
    weathercode.push(code);

    // Wind 5–25 km/h (≈ 3–15 mph), some calm periods
    const windBase = 8 + Math.sin((i / 48) * Math.PI) * 6 + (i % 5);
    windspeed_10m.push(Math.round(Math.max(2, Math.min(25, windBase)) * 10) / 10);

    winddirection_10m.push((180 + (i % 16) * 22.5) % 360);

    // Precipitation mm: zero except one event
    let precip = 0;
    if (i === 28) precip = 2.3;
    if (i === 29) precip = 0.5;
    precipitation.push(precip);

    cloudcover.push(code === 0 ? 10 + (i % 10) : code === 1 ? 35 : code === 2 ? 65 : 90);
  }

  return {
    latitude: 36.75,
    longitude: -119.77,
    hourly: {
      time,
      temperature_2m,
      relative_humidity_2m,
      precipitation_probability,
      weathercode,
      windspeed_10m,
      winddirection_10m,
      precipitation,
      cloudcover,
    },
  };
}

export const MOCK_FORECAST: ForecastResponse = buildMockForecast();
