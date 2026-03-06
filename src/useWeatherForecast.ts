import { useEffect, useMemo, useState } from 'react';
import { runFieldStateEngine } from './fieldStateEngine';
import { MOCK_FORECAST } from './mockWeather';
import type { PairedHour } from './types';
import { fetchWeatherForecast } from './weatherApi';

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
} {
  const [forecast, setForecast] = useState<typeof MOCK_FORECAST | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const liveForecast = await fetchWeatherForecast(controller.signal);
        setForecast(liveForecast);
        setIsLive(true);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error('Falling back to mock weather data.', error);
        setForecast(MOCK_FORECAST);
        setIsLive(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  const paired = useMemo(() => (forecast ? runFieldStateEngine(forecast) : []), [forecast]);
  const nowIndex = useMemo(() => getCurrentHourIndex(paired), [paired]);

  return {
    paired,
    nowIndex,
    isLoading: forecast === null,
    isLive,
  };
}
