import { Periapses, DistanceResult } from '../types'

export default class PhysicsService {
  static MAX_ECCENTRICITY = 0.8

  static KM_TO_AU = 6.68459e-9

  static GRAVITATIONAL_CONSTANT = 6.67408e-11

  static meanAnomaly(t: number, P: number): number {
    return ((t / P) % 1) * 360
  }

  static eccentricAnomaly(ecc: number, time: number, periapses: Periapses): number {
    const last = periapses.last / 1000
    const next = periapses.next / 1000

    const timePassed = time - last
    const period = next - last

    let meanAnomaly = this.meanAnomaly(timePassed, period) / 360
    let E: number
    let F: number

    meanAnomaly = 2 * Math.PI * (meanAnomaly - Math.floor(meanAnomaly))
    E = ecc < this.MAX_ECCENTRICITY ? meanAnomaly : Math.PI
    F = E - ecc * Math.sin(meanAnomaly) - meanAnomaly

    // numerical approximation for Kepler's second law (10 iterations)
    for (let i = 0; i < 10; i++) {
      E = E - F / (1 - ecc * Math.cos(E))
      F = E - ecc * Math.sin(E) - meanAnomaly
    }
    return E
  }

  static getTheta(ecc: number, E: number): number {
    const halfPi = Math.PI / 180
    const min = Math.sqrt(1 - Math.pow(ecc, 2))
    const theta = Math.atan2(min * Math.sin(E), Math.cos(E) - ecc) / halfPi

    if (theta < 0) {
      return 360 + theta
    }
    return theta
  }

  static thetaToPercent(theta: number): number {
    const percent = theta / 360

    if (percent > 1 || isNaN(percent)) {
      return 0
    }
    return percent
  }

  static ellipticPercent(ecc: number, time: number, periapses: Periapses): number {
    const E = this.eccentricAnomaly(ecc, time, periapses)
    const theta = this.getTheta(ecc, E)

    return this.thetaToPercent(theta)
  }

  static getDistanceFromAttractingBody(
    ecc: number,
    time: number,
    periapses: Periapses,
    semimajor: number
  ): DistanceResult {
    const eccAnomaly = this.eccentricAnomaly(ecc, time, periapses)
    const trueAnomaly = this.getTheta(ecc, eccAnomaly)
    const a = semimajor * 1000 // km to m
    const magnitude = a * (1 - ecc * Math.cos(eccAnomaly))
    const distance = magnitude / 1000 // m to km

    return { distance, trueAnomaly }
  }

  static orbitalEnergyConservation(
    centralMass: number,
    magnitude: number,
    semimajor: number
  ): number {
    const a = semimajor * 1000 // km to m
    const r = magnitude * 1000 // km to m
    const GM = PhysicsService.GRAVITATIONAL_CONSTANT * centralMass // m^3/s^2
    const speed = Math.sqrt(GM * (2 / r - 1 / a)) // m/s

    return speed / 1000 // m to km
  }

  static toAU(x: number, scale: number = 1): number {
    return x * scale * this.KM_TO_AU
  }
}
