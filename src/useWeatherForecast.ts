import { useEffect, useMemo, useState } from 'react';
import { runFieldStateEngine } from './fieldStateEngine';
import { MOCK_FORECAST } from './mockWeather';
import type { ForecastResponse, PairedHour } from './types';
import { fetchWeatherForecast } from './weatherApi';

type CachedWeatherState = {
  forecast: ForecastResponse;
  isLive: boolean;
  cachedAt: number;
};

let cachedWeatherState: CachedWeatherState | null = null;
let weatherRequest: Promise<CachedWeatherState> | null = null;

function getCurrentHourIndex(paired: PairedHour[]): number {
  if (paired.length === 0) return 0;

  const now = Date.now();
  let latestPastOrCurrent = 0;

  for (let i = 0; i < paired.length; i++) {
    const hourTs = new Date(paired[i].weatherHour.time).getTime();
    if (hourTs > now) {
      break;
    }

    latestPastOrCurrent = i;
  }

  return latestPastOrCurrent;
}

export function useWeatherForecast(): {
  paired: PairedHour[];
  nowIndex: number;
  isLoading: boolean;
  isLive: boolean;
  cachedAt: number | null;
} {
  const [forecast, setForecast] = useState<ForecastResponse | null>(() => cachedWeatherState?.forecast ?? null);
  const [isLive, setIsLive] = useState(() => cachedWeatherState?.isLive ?? false);
  const [cachedAt, setCachedAt] = useState<number | null>(() => cachedWeatherState?.cachedAt ?? null);

  useEffect(() => {
    if (cachedWeatherState) {
      return;
    }

    let cancelled = false;

    void (async () => {
      if (!weatherRequest) {
        weatherRequest = fetchWeatherForecast()
          .then((liveForecast) => ({
            forecast: liveForecast,
            isLive: true,
            cachedAt: Date.now(),
          }))
          .catch((error) => {
            console.error('Falling back to mock weather data.', error);
            return {
              forecast: MOCK_FORECAST,
              isLive: false,
              cachedAt: Date.now(),
            };
          })
          .finally(() => {
            weatherRequest = null;
          });
      }

      const nextState = await weatherRequest;
      cachedWeatherState = nextState;

      if (!cancelled) {
        setForecast(nextState.forecast);
        setIsLive(nextState.isLive);
        setCachedAt(nextState.cachedAt);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const paired = useMemo(() => (forecast ? runFieldStateEngine(forecast) : []), [forecast]);
  const nowIndex = useMemo(() => getCurrentHourIndex(paired), [paired]);

  return {
    paired,
    nowIndex,
    isLoading: forecast === null,
    isLive,
    cachedAt,
  };
}
