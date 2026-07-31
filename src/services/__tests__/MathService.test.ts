import { MathService } from '../MathService'

describe('Math Service', () => {
  describe('ramanujan()', () => {
    it('should solve for the circumference of an ellipse', () => {
      const result = MathService.ramanujan(5, 10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(-48.44210548835644)
    })
  })

  describe('getFocus()', () => {
    it('should solve for one of two focii of an ellipse', () => {
      const result = MathService.getFocus(5, 10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(result)
    })
  })

  describe('toRadians()', () => {
    it('should return radians for the given `deg` parameter', () => {
      const result = MathService.toRadians(10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(0.17453292519943295)
    })
  })

  describe('toDegrees()', () => {
    it('should return radians for the given `rad` parameter', () => {
      const result = MathService.toDegrees(10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(572.9577951308232)
    })
  })

  describe('arcSecToRad()', () => {
    it('should return arcseconds for the given rotation and time', () => {
      const result = MathService.arcSecToRad(1, 10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(0.0000484813681109536)
    })
  })

  describe('arcSecToDeg()', () => {
    it('should return arcseconds for the given rotation and time', () => {
      const result = MathService.arcSecToDeg(1, 10)

      expect(typeof result).toBe('number')
      expect(result).toEqual(0.002777777777777778)
    })
  })

  describe('getGeometricStep()', () => {
    it('should start at the distance it is leaving', () => {
      expect(MathService.getGeometricStep(10, 1000, 0)).toBeCloseTo(10)
    })

    it('should land on the distance it is closing in on', () => {
      expect(MathService.getGeometricStep(10, 1000, 1)).toBeCloseTo(1000)
    })

    it('should close in just the same when the destination is nearer than the start', () => {
      expect(MathService.getGeometricStep(1000, 10, 1)).toBeCloseTo(10)
    })

    it('should cover the same ratio of ground for every equal step of progress', () => {
      const quarter = MathService.getGeometricStep(1, 10000, 0.25)
      const half = MathService.getGeometricStep(1, 10000, 0.5)

      expect(half / quarter).toBeCloseTo(quarter / 1)
    })
  })
})
