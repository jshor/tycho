import { EllipseCurve, CurvePath, Vector2, Vector3 } from 'three'
import { Ellipse } from '../Ellipse'
import data from './__fixtures__/orbitals.json'

describe('Ellipse', () => {
  let ellipse: Ellipse

  beforeEach(() => {
    ellipse = new Ellipse(data[0])
  })

  describe('constructor()', () => {
    it('should set the semimajor and semiminor axes', () => {
      expect(ellipse).toHaveProperty('semimajor')
      expect(ellipse).toHaveProperty('semiminor')
      expect(typeof ellipse.semimajor).toBe('number')
      expect(typeof ellipse.semiminor).toBe('number')
    })

    it('should set the eccentricity', () => {
      expect(ellipse).toHaveProperty('eccentricity')
      expect(typeof ellipse.eccentricity).toBe('number')
    })
  })

  describe('render()', () => {
    it('should set the ellipse property to a new instance of EllipseCurve', () => {
      expect(ellipse).toHaveProperty('ellipse')
      expect(ellipse.ellipse).toBeInstanceOf(EllipseCurve)
    })

    it('should set the path property to a new instance of CurvePath', () => {
      expect(ellipse).toHaveProperty('path')
      expect(ellipse.path).toBeInstanceOf(CurvePath)
    })

    it('should add the ellipse curve to the path', () => {
      const path = new CurvePath<Vector2>()
      const ellipseCurve = new EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2)
      const spy = vi.spyOn(path, 'add')

      ellipse.getPath = () => path
      ellipse.getEllipseCurve = () => ellipseCurve
      ellipse.render()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(ellipseCurve)
    })
  })

  describe('getPath()', () => {
    it('should return an instance of CurvePath', () => {
      expect(ellipse.getPath()).toBeInstanceOf(CurvePath)
    })
  })

  describe('getEllipseCurve()', () => {
    it('should return an instance of EllipseCurve', () => {
      expect(ellipse.getEllipseCurve()).toBeInstanceOf(EllipseCurve)
    })
  })

  describe('getVertices()', () => {
    it('should return an array of Vector3 instances', () => {
      const vertices = ellipse.getVertices()

      expect(Array.isArray(vertices)).toBe(true)
      expect(vertices.length).toBeGreaterThan(0)
      expect(vertices[0]).toBeInstanceOf(Vector3)
    })

    it('should return vertices with z = 0 (2D ellipse projected into 3D)', () => {
      const vertices = ellipse.getVertices()
      vertices.forEach((v: Vector3) => expect(v.z).toBe(0))
    })
  })

  describe('getPosition()', () => {
    it('should return an instance of Vector3', () => {
      expect(ellipse.getPosition(0, { last: 0, next: 1 })).toBeInstanceOf(Vector3)
    })
  })
})
