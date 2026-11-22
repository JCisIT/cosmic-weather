// Live weather, air quality and place search from Open-Meteo (no key needed). Nothing here is hardcoded.

const US = /-US$/i.test(navigator.language || '')
export const UNITS = US ? { temp: '°F', wind: 'mph' } : { temp: '°C', wind: 'km/h' }

const WMO = {
  0: ['Clear', 'clear'], 1: ['Mostly clear', 'clear'], 2: ['Partly cloudy', 'cloud'], 3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'], 48: ['Freezing fog', 'fog'],
  51: ['Light drizzle', 'rain'], 53: ['Drizzle', 'rain'], 55: ['Heavy drizzle', 'rain'], 56: ['Freezing drizzle', 'rain'], 57: ['Freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'], 63: ['Rain', 'rain'], 65: ['Heavy rain', 'rain'], 66: ['Freezing rain', 'rain'], 67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'], 73: ['Snow', 'snow'], 75: ['Heavy snow', 'snow'], 77: ['Snow grains', 'snow'],
  80: ['Light showers', 'rain'], 81: ['Showers', 'rain'], 82: ['Heavy showers', 'rain'], 85: ['Snow showers', 'snow'], 86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'], 96: ['Thunderstorm with hail', 'storm'], 99: ['Thunderstorm with hail', 'storm'],
}

export function aqiLabel(aqi) {
  if (aqi == null) return null
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

async function getJson(url, tries = 2) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Weather service did not answer')
    return await res.json()
  } catch (e) {
    // One quiet retry covers a dropped connection.
    if (tries > 1) return getJson(url, tries - 1)
    throw e
  }
}

export async function searchPlaces(query) {
  const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`)
  return (data.results ?? []).map((r) => ({
    name: [r.name, r.admin1, r.country_code === 'US' ? null : r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
    tz: r.timezone,
  }))
}

// Average cloud cover over tonight's dark hours, read from the hourly forecast (which starts at today's midnight).
function cloudTonight(hourly, nowHour) {
  const from = nowHour < 4 ? nowHour : Math.max(nowHour, 20)
  const to = nowHour < 4 ? 4 : 26
  const hours = hourly.cloud_cover.slice(from, to + 1).filter((v) => v != null)
  return hours.length ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length) : null
}

export async function getWeather(place) {
  const q = `latitude=${place.lat}&longitude=${place.lon}&timezone=auto`
  const unit = US ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : ''
  const [w, air] = await Promise.all([
    getJson(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover,is_day&hourly=cloud_cover&daily=temperature_2m_max,temperature_2m_min&forecast_days=2${unit}`),
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=us_aqi`).catch(() => null),
  ])
  const [label, kind] = WMO[w.current.weather_code] ?? ['Unsettled', 'cloud']
  const aqi = air?.current?.us_aqi ?? null
  return {
    temp: Math.round(w.current.temperature_2m),
    label,
    kind,
    isDay: w.current.is_day === 1,
    wind: Math.round(w.current.wind_speed_10m),
    high: Math.round(w.daily.temperature_2m_max[0]),
    low: Math.round(w.daily.temperature_2m_min[0]),
    cloudTonight: cloudTonight(w.hourly, Number(w.current.time.slice(11, 13))),
    aqi,
    aqiLabel: aqiLabel(aqi),
  }
}

// Stargazing depends on two things: how much cloud is in the way, and how much moonlight washes out faint stars.
export function stargazing(cloud, illum) {
  if (cloud == null) return null
  const score = (100 - cloud) * (1 - 0.5 * (illum / 100))
  const rating = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : score >= 25 ? 'Fair' : 'Poor'
  const sky = cloud < 20 ? 'Clear skies' : cloud < 50 ? 'Some cloud' : cloud < 80 ? 'Mostly cloudy' : 'Clouded over'
  const moon = illum < 25 ? 'and a dark moon, so faint stars show' : illum < 65 ? 'with moderate moonlight' : 'and a bright moon that washes out faint stars'
  return { rating, reason: `${sky} tonight ${moon}.`, cloud }
}
