import type { ForecastResponse } from './types';

const FRESNO_COORDS = {
  latitude: 36.75,
  longitude: -119.77,
} as const;

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    weather_code?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    precipitation?: number[];
    cloud_cover?: number[];
  };
}

function ensureArray(values: number[] | string[] | undefined, field: string): number[] | string[] {
  if (!Array.isArray(values)) {
    throw new Error(`Open-Meteo response missing hourly.${field}`);
  }

  return values;
}

function normalizeForecast(data: OpenMeteoForecastResponse): ForecastResponse {
  const hourly = data.hourly;
  if (!hourly) {
    throw new Error('Open-Meteo response missing hourly forecast');
  }

  const time = ensureArray(hourly.time, 'time') as string[];
  const temperature_2m = ensureArray(hourly.temperature_2m, 'temperature_2m') as number[];
  const relative_humidity_2m = ensureArray(hourly.relative_humidity_2m, 'relative_humidity_2m') as number[];
  const precipitation_probability = ensureArray(
    hourly.precipitation_probability,
    'precipitation_probability'
  ) as number[];
  const weathercode = ensureArray(hourly.weather_code, 'weather_code') as number[];
  const windspeed_10m = ensureArray(hourly.wind_speed_10m, 'wind_speed_10m') as number[];
  const winddirection_10m = ensureArray(hourly.wind_direction_10m, 'wind_direction_10m') as number[];
  const precipitation = ensureArray(hourly.precipitation, 'precipitation') as number[];
  const cloudcover = ensureArray(hourly.cloud_cover, 'cloud_cover') as number[];

  const expectedLength = time.length;
  const allSeries = [
    temperature_2m,
    relative_humidity_2m,
    precipitation_probability,
    weathercode,
    windspeed_10m,
    winddirection_10m,
    precipitation,
    cloudcover,
  ];

  if (allSeries.some((series) => series.length !== expectedLength)) {
    throw new Error('Open-Meteo response hourly arrays are not aligned');
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
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

export async function fetchWeatherForecast(signal?: AbortSignal): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(FRESNO_COORDS.latitude),
    longitude: String(FRESNO_COORDS.longitude),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation',
      'cloud_cover',
    ].join(','),
    timezone: 'auto',
    forecast_days: '10',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { signal });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoForecastResponse;
  return normalizeForecast(data);
}
