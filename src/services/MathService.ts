export class MathService {
  static ramanujan(a: number, b: number): number {
    const p = 3 * b + a
    const q = 3 * a + b
    const r = 3 * (a + b)

    return Math.PI * (Math.sqrt(p * q) - r)
  }

  static getFocus(x: number, y: number): number {
    return Math.sqrt(Math.pow(x, 2) - Math.pow(y, 2))
  }

  static toRadians(deg: number): number {
    return (deg * Math.PI) / 180
  }

  static toDegrees(rad: number): number {
    return (rad * 180) / Math.PI
  }

  static arcSecToRad(time: number, rotation: number): number {
    return this.toRadians(this.arcSecToDeg(time, rotation))
  }

  static arcSecToDeg(time: number, rotation: number): number {
    return (time * (rotation / 3600)) % 360
  }

  /**
   * Returns the percent traveled between the given two numbers, geometrically.
   */
  static getGeometricStep(from: number, to: number, percent: number) {
    const start = Math.max(from, Number.EPSILON)
    const end = Math.max(to, Number.EPSILON)

    return start * Math.pow(end / start, percent)
  }
}
