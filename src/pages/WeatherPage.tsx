import { MainLayout } from '../components/layout/MainLayout';
import { type SectionId } from '../components/layout/navConfig';
import { useWeatherForecast } from '../useWeatherForecast';
import { type PairedHour, windDirectionFromDegrees } from '../types';
import './WeatherPage.css';

const LOCATION_LABEL = 'Fresno, CA';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatHourLabel(date: Date): string {
  const h = date.getHours();
  const isAm = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}${isAm ? 'am' : 'pm'}`;
}

function findIndexForTimestamp(paired: PairedHour[], ts: number): number {
  for (let i = 0; i < paired.length; i++) {
    const t = new Date(paired[i].weatherHour.time).getTime();
    if (t === ts) return i;
    if (t > ts) break;
  }
  return -1;
}

function weatherCodeToCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return code === 1 ? 'Mostly Clear' : 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  return 'Cloudy';
}

function conditionForDay(codeAtMidday: number, maxRainProb: number): string {
  if (maxRainProb >= 70) return 'Rain Likely';
  if (maxRainProb >= 35) return 'Chance of Rain';
  const base = weatherCodeToCondition(codeAtMidday);
  if (base === 'Clear') return 'Mostly Clear';
  if (base === 'Rain Showers') return 'Chance of Rain';
  return base;
}

function feelsLikeF(tempF: number, humidityPct: number, windMph: number): number {
  // Heat Index (NOAA) when warm/humid; Wind Chill when cold/windy; else actual temp.
  if (tempF >= 80 && humidityPct >= 40) {
    const T = tempF;
    const R = humidityPct;
    const hi =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R +
      -0.22475541 * T * R +
      -0.00683783 * T * T +
      -0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R +
      -0.00000199 * T * T * R * R;
    return hi;
  }
  if (tempF <= 50 && windMph >= 3) {
    const v16 = Math.pow(windMph, 0.16);
    return 35.74 + 0.6215 * tempF - 35.75 * v16 + 0.4275 * tempF * v16;
  }
  return tempF;
}

export function WeatherPage() {
  const { paired, nowIndex, isLoading } = useWeatherForecast();

  if (isLoading || paired.length === 0) {
    return (
      <div className="weatherPage__loading">
        Loading…
      </div>
    );
  }

  const nowPair = paired[Math.min(nowIndex, paired.length - 1)];
  const nowWeather = nowPair.weatherHour;
  const nowDate = new Date(nowWeather.time);
  const refMidnight = new Date(nowDate);
  refMidnight.setHours(0, 0, 0, 0);

  const todayStartIndex = (() => {
    const idx = findIndexForTimestamp(paired, refMidnight.getTime());
    return idx >= 0 ? idx : clamp(nowIndex - nowDate.getHours(), 0, paired.length - 1);
  })();
  const todaySlice = paired.slice(todayStartIndex, Math.min(todayStartIndex + 24, paired.length));
  const todayHigh = Math.max(...todaySlice.map((p) => p.weatherHour.temperature_2m));
  const todayLow = Math.min(...todaySlice.map((p) => p.weatherHour.temperature_2m));

  const nowTempF = nowWeather.temperature_2m;
  const nowFeelsLike = feelsLikeF(nowTempF, nowWeather.relative_humidity_2m, nowWeather.windspeed_10m);
  const nowWindDir = windDirectionFromDegrees(nowWeather.winddirection_10m);

  const hourlyNext = paired.slice(nowIndex, Math.min(nowIndex + 24, paired.length)).map((p) => p.weatherHour);

  const days = Array.from({ length: 7 }, (_, d) => {
    const dayStart = new Date(refMidnight);
    dayStart.setDate(dayStart.getDate() + d);
    const startIdx = findIndexForTimestamp(paired, dayStart.getTime());
    const fallbackIdx = todayStartIndex + d * 24;
    const dayIndex = startIdx >= 0 ? startIdx : fallbackIdx;
    const slice = paired.slice(dayIndex, Math.min(dayIndex + 24, paired.length)).map((p) => p.weatherHour);
    const temps = slice.map((h) => h.temperature_2m);
    const winds = slice.map((h) => h.windspeed_10m);
    const rain = slice.map((h) => h.precipitation_probability);
    const midday = slice.find((h) => new Date(h.time).getHours() === 12) ?? slice[Math.floor(slice.length / 2)];
    const maxRain = rain.length ? Math.max(...rain) : 0;
    const avgWind = winds.length ? winds.reduce((s, v) => s + v, 0) / winds.length : 0;
    return {
      date: dayStart,
      label: d === 0 ? 'Today' : dayStart.toLocaleDateString('en-US', { weekday: 'long' }),
      condition: conditionForDay(midday?.weathercode ?? 2, maxRain),
      high: temps.length ? Math.max(...temps) : nowTempF,
      low: temps.length ? Math.min(...temps) : nowTempF,
      windAvg: avgWind,
      rainMax: maxRain,
    };
  });

  const sectionStatus: Record<SectionId, null> = {
    spray: null,
    harvest: null,
  };

  return (
    <MainLayout
      mainContent={
        <div className="weather-page weatherPage__root">
          <section className="weatherPage__sectionHero">
            <div className="weather-current">
              <div className="weatherPage__currentLeft">
                <div className="weatherPage__location">
                  {LOCATION_LABEL}
                </div>
                <div
                  className="weatherPage__temp"
                  data-hot={nowTempF > 95}
                >
                  {Math.round(nowTempF)}°
                </div>
                <div className="weatherPage__condition">
                  {weatherCodeToCondition(nowWeather.weathercode)}
                </div>
                <div className="weatherPage__highLow">
                  <span>High {Math.round(todayHigh)}°</span>
                  <span className="weatherPage__highLowDot" />
                  <span>Low {Math.round(todayLow)}°</span>
                </div>
              </div>

              <div className="weather-currentSupport">
                {[
                  { label: 'Feels Like', value: `${Math.round(nowFeelsLike)}°` },
                  { label: 'Humidity', value: `${Math.round(nowWeather.relative_humidity_2m)}%` },
                  { label: 'Wind', value: `${Math.round(nowWeather.windspeed_10m)} mph ${nowWindDir}` },
                  { label: 'Precipitation', value: `${Math.round(nowWeather.precipitation_probability)}%` },
                ].map((item) => (
                  <div key={item.label} className="weatherPage__supportItem">
                    <div className="weatherPage__supportLabel">{item.label}</div>
                    <div className="weatherPage__supportValue">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="weatherPage__sectionHourly">
            <div className="weather-hourlyWrap">
              <div className="weather-hourlyStrip weatherPage__hourlyStripInner">
                {hourlyNext.map((h, i) => {
                  const d = new Date(h.time);
                  const label = i === 0 ? 'NOW' : formatHourLabel(d);
                  const tempF = h.temperature_2m;
                  const precipProb = clamp(h.precipitation_probability, 0, 100);
                  return (
                    <div key={h.time} className="weatherPage__hourlyCard">
                      <div className="weatherPage__hourlyLabel">{label}</div>
                      <div
                        className="weatherPage__hourlyTemp"
                        data-hot={tempF > 95}
                      >
                        {Math.round(tempF)}°
                      </div>
                      <div className="weatherPage__hourlyPrecip">
                        {Math.round(precipProb)}%
                      </div>
                      <div className="weatherPage__hourlyWind">
                        {Math.round(h.windspeed_10m)}mph
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="weatherPage__sectionForecast">
            <div className="weather-forecast weatherPage__forecastWrap">
              {days.map((d, idx) => {
                const rain = clamp(d.rainMax, 0, 100);
                return (
                  <div key={d.label}>
                    <div className="weather-forecastGrid">
                      <div
                        className="weatherPage__dayLabel"
                        data-today={idx === 0}
                      >
                        {d.label}
                      </div>
                      <div className="weatherPage__forecastCondition">{d.condition}</div>
                      <div className="weatherPage__forecastTemps">
                        <span className="weatherPage__forecastHigh" data-hot={d.high > 95}>H {Math.round(d.high)}°</span>
                        <span className="weatherPage__forecastLow">L {Math.round(d.low)}°</span>
                      </div>
                      <div className="weatherPage__forecastWind">
                        {Math.round(d.windAvg)} mph
                      </div>
                      <div className="weatherPage__rainRow">
                        <div className="weatherPage__rainPct">
                          {Math.round(rain)}%
                        </div>
                        <div className="weatherPage__rainBar" aria-hidden>
                          <div
                            className="weatherPage__rainFill"
                            style={{ width: `${(rain / 100) * 48}px` }}
                          />
                        </div>
                      </div>
                    </div>
                    {idx < days.length - 1 && <div className="weatherPage__rowDivider" />}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      }
      activeSection={null}
      sectionStatus={sectionStatus}
      onNavigate={() => {}}
    />
  );
}
