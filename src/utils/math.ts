/**
 * Returns an approximation of the circumference of an ellipse with the given axes.
 */
export function ramanujan(a: number, b: number): number {
  const p = 3 * b + a
  const q = 3 * a + b
  const r = 3 * (a + b)

  return Math.PI * (Math.sqrt(p * q) - r)
}

/**
 * Returns the distance from the center (read: NOT focus) of an ellipse to either of its foci.
 */
export function getFocus(x: number, y: number): number {
  return Math.sqrt(Math.pow(x, 2) - Math.pow(y, 2))
}

/**
 * Returns the given angle in radians.
 */
export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Returns the given angle in degrees.
 */
export function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

/**
 * Returns the radians turned through over the given time at the given arcseconds per unit.
 */
export function arcSecToRad(time: number, rotation: number): number {
  return toRadians(arcSecToDeg(time, rotation))
}

/**
 * Returns the degrees turned through over the given time at the given arcseconds per unit.
 */
export function arcSecToDeg(time: number, rotation: number): number {
  return (time * (rotation / 3600)) % 360
}

/**
 * Returns the percent traveled between the given two numbers, geometrically.
 */
export function getGeometricStep(from: number, to: number, percent: number): number {
  const start = Math.max(from, Number.EPSILON)
  const end = Math.max(to, Number.EPSILON)

  return start * Math.pow(end / start, percent)
}
