import { MainLayout } from '../components/layout/MainLayout';
import { type SectionId } from '../components/layout/navConfig';
import { usePairedData } from '../usePairedData';
import { THRESHOLDS } from '../constants';
import { windDirectionFromDegrees } from '../types';

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

function formatTimeLong(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function findIndexForTimestamp(paired: ReturnType<typeof usePairedData>['paired'], ts: number): number {
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

function tempDisplayColor(tempF: number): string {
  return tempF > 95 ? '#ffd580' : '#ffffff';
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

function findFirstSustainedRange(
  hours: { time: string; windMph: number }[],
  thresholdMph: number,
  minConsecutiveHours: number
): { start: Date; endInclusive: Date } | null {
  let runStart = -1;
  for (let i = 0; i < hours.length; i++) {
    const meets = hours[i].windMph >= thresholdMph;
    if (meets && runStart === -1) runStart = i;
    if (!meets && runStart !== -1) {
      const runLen = i - runStart;
      if (runLen >= minConsecutiveHours) {
        const start = new Date(hours[runStart].time);
        const endInclusive = new Date(hours[i - 1].time);
        return { start, endInclusive };
      }
      runStart = -1;
    }
  }
  if (runStart !== -1) {
    const runLen = hours.length - runStart;
    if (runLen >= minConsecutiveHours) {
      return {
        start: new Date(hours[runStart].time),
        endInclusive: new Date(hours[hours.length - 1].time),
      };
    }
  }
  return null;
}

export function WeatherPage() {
  const { paired, nowIndex } = usePairedData();

  if (paired.length === 0) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)' }}>
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

  const next24 = paired
    .slice(nowIndex, Math.min(nowIndex + 24, paired.length))
    .map((p) => ({ time: p.weatherHour.time, windMph: p.weatherHour.windspeed_10m, dirDeg: p.weatherHour.winddirection_10m }));
  const avgWind24 = next24.length ? next24.reduce((s, h) => s + h.windMph, 0) / next24.length : nowWeather.windspeed_10m;
  const peakWind24 = next24.reduce(
    (best, h) => (h.windMph > best.windMph ? h : best),
    next24[0] ?? { time: nowWeather.time, windMph: nowWeather.windspeed_10m, dirDeg: nowWeather.winddirection_10m }
  );
  const shiftDir = windDirectionFromDegrees(peakWind24.dirDeg);

  const sprayWindThreshold = THRESHOLDS.spray.windMaxMph;
  const highWindThreshold = THRESHOLDS.conditionBar.wind.highAboveMph;
  const aboveSpray = findFirstSustainedRange(next24, sprayWindThreshold, 2);
  const aboveHigh = findFirstSustainedRange(next24, highWindThreshold, 2);

  const sectionStatus: Record<SectionId, null> = {
    spray: null,
    harvest: null,
  };

  return (
    <MainLayout
      mainContent={
        <div
          className="weather-page"
          style={{
            paddingTop: 12,
            paddingBottom: 56,
            color: 'var(--wx-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <section style={{ paddingTop: 52, paddingBottom: 44 }}>
            <div className="weather-current">
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 16, fontWeight: 400, color: 'var(--wx-text-primary)', marginBottom: 12 }}>
                  {LOCATION_LABEL}
                </div>
                <div
                  style={{
                    fontSize: 96,
                    fontWeight: 300,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: tempDisplayColor(nowTempF),
                    marginBottom: 10,
                  }}
                >
                  {Math.round(nowTempF)}°
                </div>
                <div style={{ fontSize: 18, fontWeight: 300, color: 'var(--wx-text-secondary)', marginBottom: 14 }}>
                  {weatherCodeToCondition(nowWeather.weathercode)}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: 'var(--wx-text-tertiary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span>High {Math.round(todayHigh)}°</span>
                  <span style={{ width: 3, height: 3, borderRadius: 999, backgroundColor: 'var(--wx-divider)' }} />
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
                  <div key={item.label} style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--wx-text-tertiary)', marginBottom: 6 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 400, color: 'var(--wx-text-primary)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ paddingTop: 6, paddingBottom: 34 }}>
            <div className="weather-hourlyWrap">
              <div
                className="weather-hourlyStrip"
                style={{
                  paddingTop: 14,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--wx-divider)',
                }}
              >
                {hourlyNext.map((h, i) => {
                  const d = new Date(h.time);
                  const label = i === 0 ? 'NOW' : formatHourLabel(d);
                  const tempF = h.temperature_2m;
                  const precipProb = clamp(h.precipitation_probability, 0, 100);
                  return (
                    <div
                      key={h.time}
                      style={{
                        flex: '0 0 auto',
                        width: 56,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 10,
                        padding: '0 10px',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>{label}</div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 400,
                          color: tempDisplayColor(tempF),
                          lineHeight: 1.1,
                        }}
                      >
                        {Math.round(tempF)}°
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--wx-text-primary)' }}>
                        {Math.round(precipProb)}%
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>
                        {Math.round(h.windspeed_10m)}mph
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section style={{ paddingTop: 6, paddingBottom: 46 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {days.map((d, idx) => {
                const rain = clamp(d.rainMax, 0, 100);
                const showDayLabelInWhite = idx === 0;
                return (
                  <div key={d.label}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 260px 170px 90px 140px',
                        columnGap: 18,
                        alignItems: 'center',
                        padding: '14px 0',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: showDayLabelInWhite ? 'var(--wx-text-primary)' : 'var(--wx-text-secondary)',
                        }}
                      >
                        {d.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--wx-text-secondary)' }}>{d.condition}</div>
                      <div style={{ fontSize: 14, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontWeight: 500, color: tempDisplayColor(d.high) }}>H {Math.round(d.high)}°</span>
                        <span style={{ fontWeight: 400, color: 'var(--wx-text-tertiary)' }}>L {Math.round(d.low)}°</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>
                        {Math.round(d.windAvg)} mph
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--wx-text-primary)', width: 44 }}>
                          {Math.round(rain)}%
                        </div>
                        <div
                          aria-hidden
                          style={{
                            width: 48,
                            height: 4,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(rain / 100) * 48}px`,
                              height: 4,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              borderRadius: 999,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {idx < days.length - 1 && <div style={{ height: 1, backgroundColor: 'var(--wx-divider)' }} />}
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ paddingTop: 2, paddingBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--wx-text-tertiary)', marginBottom: 16 }}>
              WIND — NEXT 24 HOURS
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 120px',
                gap: 56,
                alignItems: 'start',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
                {[
                  { label: 'Average', value: `${Math.round(avgWind24)} mph` },
                  { label: 'Peak', value: `${Math.round(peakWind24.windMph)} mph`, suffix: formatTimeLong(new Date(peakWind24.time)) },
                  {
                    label: 'Direction',
                    value: nowWindDir,
                    suffix: nowWindDir !== shiftDir ? `shifting to ${shiftDir} by ${formatTimeLong(new Date(peakWind24.time))}` : undefined,
                  },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', columnGap: 18, alignItems: 'baseline' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>{row.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 400, color: 'var(--wx-text-primary)' }}>
                      {row.value}
                      {row.suffix ? (
                        <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>
                          {row.suffix}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}

                {!aboveSpray ? (
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 400, color: 'var(--wx-text-secondary)' }}>
                    No sustained winds above spray threshold forecast.
                  </div>
                ) : (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      {
                        label: `Above ${sprayWindThreshold} mph`,
                        range: aboveSpray
                          ? `${formatTimeLong(aboveSpray.start)} – ${formatTimeLong(aboveSpray.endInclusive)}`
                          : 'Not forecast',
                      },
                      {
                        label: `Above ${highWindThreshold} mph`,
                        range: aboveHigh
                          ? `${formatTimeLong(aboveHigh.start)} – ${formatTimeLong(aboveHigh.endInclusive)}`
                          : 'Not forecast',
                      },
                    ].map((row) => (
                      <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', columnGap: 18 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--wx-text-tertiary)' }}>{row.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--wx-text-secondary)' }}>{row.range}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: 2 }}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  role="img"
                  aria-label="Wind direction"
                  style={{ display: 'block' }}
                >
                  <g stroke="rgba(255,255,255,0.75)" strokeWidth="1" strokeLinecap="round">
                    {Array.from({ length: 8 }, (_, i) => {
                      const angle = (i * 45 * Math.PI) / 180;
                      const cx = 40;
                      const cy = 40;
                      const r0 = 30;
                      const r1 = i % 2 === 0 ? 36 : 34;
                      const x0 = cx + r0 * Math.sin(angle);
                      const y0 = cy - r0 * Math.cos(angle);
                      const x1 = cx + r1 * Math.sin(angle);
                      const y1 = cy - r1 * Math.cos(angle);
                      return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} />;
                    })}
                    <circle cx="40" cy="40" r="24" fill="none" stroke="rgba(255,255,255,0.18)" />
                  </g>
                  <g
                    transform={`rotate(${nowWeather.winddirection_10m} 40 40)`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="40" y1="40" x2="40" y2="14" />
                    <path d="M40 10 L35 18 L45 18 Z" fill="#ffffff" stroke="none" />
                  </g>
                </svg>
              </div>
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
