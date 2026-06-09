import { Euler } from 'three'

/**
 * Returns the distance from the foci to the center of an ellipse.
 *
 * @param {Number} x - semimajor axis
 * @param {Number} y - semiminor axis
 * @returns {Number} focus of ellipse
 */
export function getFocus (x: number, y: number): number {
  return Math.sqrt(Math.abs(Math.pow(x, 2) - Math.pow(y, 2)))
}

/**
 * Converts degrees to radians.
 *
 * @param {Number} degrees
 * @returns {Number} radians
 */
export function toRadians (degrees: number): number {
  return degrees * Math.PI / 180
}

/** Angle (in degrees) of the ascending node relative to the reference plane. */
const ASCENSION = 90

/**
 * Rotation of the ecliptic group: orients an orbital plane relative to the
 * ecliptic using the longitude of the ascending node.
 *
 * @param {Number} longitudeOfAscendingNode - in degrees
 * @returns {Euler}
 */
export function getEclipticRotation (longitudeOfAscendingNode: number): Euler {
  return new Euler(
    toRadians(-ASCENSION),
    0,
    toRadians(ASCENSION + longitudeOfAscendingNode)
  )
}

/**
 * Rotation of the orbital group: tilts the orbit by its inclination and
 * orients the periapsis via the argument of periapsis.
 *
 * @param {Number} inclination - in degrees
 * @param {Number} argumentOfPeriapsis - in degrees
 * @returns {Euler}
 */
export function getOrbitalRotation (inclination: number, argumentOfPeriapsis: number): Euler {
  return new Euler(
    toRadians(inclination),
    0,
    toRadians(ASCENSION + argumentOfPeriapsis)
  )
}
