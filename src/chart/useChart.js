import { useMemo } from 'react'
import { computeChart, zonedToUtc } from './chart.js'

// A chart can be drawn only when we know the date, the time and the time zone of the birth place.
export const canCompute = (p) => Boolean(p?.birth_date && p?.birth_time && p?.birth_tz)

export function chartFor(p) {
  if (!canCompute(p)) return null
  try {
    return computeChart(zonedToUtc(p.birth_date, p.birth_time.slice(0, 5), p.birth_tz))
  } catch {
    return null
  }
}

export function useChart(profile) {
  return useMemo(() => chartFor(profile), [profile?.birth_date, profile?.birth_time, profile?.birth_tz])
}
