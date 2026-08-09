import { Periapses, DistanceResult } from '../types'

/** The eccentricity above which the approximation sets out from half a turn rather than the mean anomaly. */
export const MAX_ECCENTRICITY = 0.8

/** Astronomical units per kilometer. */
export const KM_TO_AU = 6.68459e-9

/** The gravitational constant. */
export const GRAVITATIONAL_CONSTANT = 6.67408e-11

/**
 * Returns the angle in degrees a body would have swept at a steady rate over the given time.
 */
export function meanAnomaly(t: number, P: number): number {
  return ((t / P) % 1) * 360
}

/**
 * Returns the approximated eccentric anomaly of a body at the given time.
 *
 * Uses Newton's method.
 */
export function eccentricAnomaly(ecc: number, time: number, periapses: Periapses): number {
  const last = periapses.last / 1000
  const next = periapses.next / 1000

  const timePassed = time - last
  const period = next - last

  let mean = meanAnomaly(timePassed, period) / 360
  let E: number
  let F: number

  mean = 2 * Math.PI * (mean - Math.floor(mean))
  E = ecc < MAX_ECCENTRICITY ? mean : Math.PI
  F = E - ecc * Math.sin(mean) - mean

  // numerical approximation for Kepler's second law (10 iterations)
  for (let i = 0; i < 10; i++) {
    E = E - F / (1 - ecc * Math.cos(E))
    F = E - ecc * Math.sin(E) - mean
  }
  return E
}

/**
 * Returns the true anomaly in degrees for the given eccentric anomaly.
 */
export function getTheta(ecc: number, E: number): number {
  const halfPi = Math.PI / 180
  const min = Math.sqrt(1 - Math.pow(ecc, 2))
  const theta = Math.atan2(min * Math.sin(E), Math.cos(E) - ecc) / halfPi

  if (theta < 0) {
    return 360 + theta
  }
  return theta
}

/**
 * Returns the given true anomaly as a fraction of one full revolution.
 */
export function thetaToPercent(theta: number): number {
  const percent = theta / 360

  if (percent > 1 || isNaN(percent)) {
    return 0
  }
  return percent
}

/**
 * Returns how far around its ellipse a body has travelled at the given time.
 */
export function ellipticPercent(ecc: number, time: number, periapses: Periapses): number {
  const E = eccentricAnomaly(ecc, time, periapses)
  const theta = getTheta(ecc, E)

  return thetaToPercent(theta)
}

/**
 * Returns a body's distance in km from what it orbits at the given time, w.r.t. its true anomaly.
 */
export function getDistanceFromAttractingBody(
  ecc: number,
  time: number,
  periapses: Periapses,
  semimajor: number
): DistanceResult {
  const eccAnomaly = eccentricAnomaly(ecc, time, periapses)
  const trueAnomaly = getTheta(ecc, eccAnomaly)
  const a = semimajor * 1000 // km to m
  const magnitude = a * (1 - ecc * Math.cos(eccAnomaly))
  const distance = magnitude / 1000 // m to km

  return { distance, trueAnomaly }
}

/**
 * Returns a body's speed in km/s along its current vector.
 *
 * Uses the vis-viva equation.
 */
export function orbitalEnergyConservation(
  centralMass: number,
  magnitude: number,
  semimajor: number
): number {
  const a = semimajor * 1000 // km to m
  const r = magnitude * 1000 // km to m
  const GM = GRAVITATIONAL_CONSTANT * centralMass // m^3/s^2
  const speed = Math.sqrt(GM * (2 / r - 1 / a)) // m/s

  return speed / 1000 // m to km
}

/**
 * Converts the given distance in km to astronomical units at the given scale.
 */
export function toAU(x: number, scale: number = 1): number {
  return x * scale * KM_TO_AU
}
