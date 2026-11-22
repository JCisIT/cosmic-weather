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
    if (tries > 1) {
      await new Promise((r) => setTimeout(r, 1200))
      return getJson(url, tries - 1)
    }
    throw e
  }
}

const REGION = ((navigator.language || '').split('-')[1] || '').toUpperCase()
const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia' }

// People type "Martinez, CA" or "Paris, France". The service only matches the town name, so search on the part
// before the comma and use the rest to put the right one on top.
export async function searchPlaces(query) {
  const [town, ...rest] = query.split(',').map((s) => s.trim()).filter(Boolean)
  if (!town) return []
  const hintRaw = rest.join(' ').toLowerCase()
  const hint = (STATES[hintRaw.toUpperCase()] ?? hintRaw).toLowerCase()
  const data = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(town)}&count=20&language=en&format=json`)
  const found = data.results ?? []
  const score = (r) => {
    let n = 0
    if (hint && [r.admin1, r.country, r.country_code].some((x) => x && (x.toLowerCase() === hint || x.toLowerCase().startsWith(hint)))) n += 4
    if (r.country_code === REGION) n += 1
    return n
  }
  // A stable sort keeps the service's own order (roughly by size) within each score.
  const ranked = found.map((r, i) => ({ r, i, n: score(r) })).sort((x, y) => y.n - x.n || x.i - y.i).slice(0, 6)
  return ranked.map(({ r }) => ({
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

// '2026-11-21T06:59' (already in the place's own time) becomes '6:59 am'.
function clockTime(iso) {
  if (!iso) return null
  const [h, m] = iso.slice(11, 16).split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

export function localTime(tz) {
  try {
    return new Date().toLocaleTimeString([], { timeZone: tz, hour: 'numeric', minute: '2-digit' })
  } catch {
    return null
  }
}

// Straight-line distance between two places, in the person's own units.
export function distance(a, b) {
  const rad = (d) => (d * Math.PI) / 180
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2
  const km = 12742 * Math.asin(Math.sqrt(h))
  const n = US ? km * 0.621371 : km
  return `${Math.round(n).toLocaleString()} ${US ? 'miles' : 'km'}`
}

const minutes = (iso) => (iso ? Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16)) : null)

// Is the sun coming up or going down there right now (within 40 minutes)?
function momentOf(w) {
  const now = minutes(w.current.time)
  const rise = minutes(w.daily.sunrise?.[0])
  const set = minutes(w.daily.sunset?.[0])
  if (rise != null && Math.abs(now - rise) <= 40) return 'sunrise'
  if (set != null && Math.abs(now - set) <= 40) return 'sunset'
  return null
}

function shape(w, air) {
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
    sunrise: clockTime(w.daily.sunrise?.[0]),
    sunset: clockTime(w.daily.sunset?.[0]),
    daylightMin: w.daily.daylight_duration?.[0] != null ? Math.round(w.daily.daylight_duration[0] / 60) : null,
    moment: momentOf(w),
    aqi,
    aqiLabel: aqiLabel(aqi),
  }
}

const CACHE_MINUTES = 10

// Weather for several places in ONE request each to the forecast and air-quality services, kept for ten minutes
// so flipping between tabs does not ask again. Returns one result per place, in the same order.
export async function getWeatherAll(places) {
  if (!places.length) return []
  const key = 'cw:wx:' + places.map((p) => `${p.lat},${p.lon}`).join('|')
  try {
    const hit = JSON.parse(sessionStorage.getItem(key))
    if (hit && Date.now() - hit.at < CACHE_MINUTES * 60000) return hit.data
  } catch {
    /* no cache available: just fetch */
  }
  const q = `latitude=${places.map((p) => p.lat).join(',')}&longitude=${places.map((p) => p.lon).join(',')}&timezone=auto`
  const unit = US ? '&temperature_unit=fahrenheit&wind_speed_unit=mph' : ''
  const [w, air] = await Promise.all([
    getJson(`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,weather_code,wind_speed_10m,cloud_cover,is_day&hourly=cloud_cover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration&forecast_days=2${unit}`),
    getJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${q}&current=us_aqi`).catch(() => null),
  ])
  // One place comes back as an object, several as a list.
  const ws = Array.isArray(w) ? w : [w]
  const airs = air ? (Array.isArray(air) ? air : [air]) : []
  const data = ws.map((one, i) => shape(one, airs[i]))
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* fine without a cache */
  }
  return data
}

// Minutes as '4 hr 5 min'.
export function duration(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return [h ? `${h} hr` : null, m ? `${m} min` : null].filter(Boolean).join(' ')
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
