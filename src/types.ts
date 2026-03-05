/**
 * Open-Meteo–shaped forecast response (hourly).
 * Mock and future API both conform to this.
 */
export interface ForecastResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation_probability: number[];
    weathercode: number[];
    windspeed_10m: number[];
    winddirection_10m: number[];
    precipitation: number[];
    cloudcover?: number[];
  };
}

/**
 * One hour's slice of the hourly arrays.
 */
export interface WeatherHour {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation_probability: number;
  weathercode: number;
  windspeed_10m: number;
  winddirection_10m: number;
  precipitation: number;
  cloudcover: number;
}

/**
 * Field state at a given hour (engine output).
 */
export interface FieldState {
  soilMoisture: number;
  leafWetness: number;
  rain24h: number;
  dryStreakHours: number;
  daysSinceRain: number;
}

export interface PairedHour {
  weatherHour: WeatherHour;
  fieldState: FieldState;
}

/** Wind direction abbreviation from degrees */
export const WIND_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

export function windDirectionFromDegrees(deg: number): string {
  const index = Math.round(deg / 22.5) % 16;
  return WIND_DIRECTIONS[index];
}

/** Convert km/h to mph (Open-Meteo returns km/h) */
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

/** Convert °C to °F */
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}
