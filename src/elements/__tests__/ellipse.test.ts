import { Color, EllipseCurve, CurvePath, Vector2, Vector3 } from 'three'
import { Ellipse } from '../ellipse'
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

  describe('getPathVertices()', () => {
    it('should return an array of Vector3 instances', () => {
      const vertices = ellipse.getPathVertices()

      expect(Array.isArray(vertices)).toBe(true)
      expect(vertices.length).toBeGreaterThan(0)
      expect(vertices[0]).toBeInstanceOf(Vector3)
    })

    it('should return vertices with z = 0 (2D ellipse projected into 3D)', () => {
      const vertices = ellipse.getPathVertices()
      vertices.forEach((v: Vector3) => expect(v.z).toBe(0))
    })
  })

  describe('getPosition()', () => {
    it('should return an instance of Vector3', () => {
      expect(ellipse.getPosition()).toBeInstanceOf(Vector3)
    })
  })

  describe('updateTime()', () => {
    it('should take the clock on to the given time', () => {
      ellipse.updateTime(20000000)

      expect(ellipse.time).toEqual(20000000)
    })

    it('should trace the path and the trail anew for the time it was given', () => {
      ellipse.updateTime(20000000)

      expect(ellipse.pathVertices.length).toBeGreaterThan(0)
      expect(ellipse.trailVertices).toHaveLength(ellipse.pathVertices.length)
    })
  })

  describe('getTrailingVertices()', () => {
    const bodyPosition = new Vector3(1, 0.5, 0)
    const orbit = [
      new Vector3(0, 0, 0),
      new Vector3(1, 0, 0),
      new Vector3(1, 1, 0),
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 0)
    ]

    /** The trail as it runs once the body has travelled the given way around its orbit. */
    const trailAt = (bodyPercent: number) => {
      ellipse.pathVertices = orbit
      ellipse.getPosition = () => bodyPosition
      ellipse.getVertexPercent = () => bodyPercent

      return ellipse.getTrailingVertices()
    }

    it('should set the trail out from the body itself, so that nothing runs on ahead of it', () => {
      expect(trailAt(0.3)[0]).toBe(bodyPosition)
    })

    it('should trail back behind the body, away from where it is headed', () => {
      expect(trailAt(0.3).slice(1)).toEqual([orbit[1], orbit[0], orbit[3], orbit[2]])
    })

    it('should carry once around the orbit, without redrawing where it closes', () => {
      const trail = trailAt(0.3)

      expect(trail).toHaveLength(orbit.length)
      expect(new Set(trail.slice(1)).size).toEqual(orbit.length - 1)
    })

    it('should pick up from the vertex the body has just passed', () => {
      expect(trailAt(0.8)[1]).toBe(orbit[3])
    })
  })

  describe('getTrailingPathColors()', () => {
    it('should fade the trail out along its length, from the body to its far end', () => {
      ellipse.updateTime(1)

      const alphas = ellipse.getTrailingPathColors().map(([, , , alpha]) => alpha)

      expect(alphas[0]).toEqual(1)
      expect(alphas[alphas.length - 1]).toEqual(0)
      expect(alphas).toEqual([...alphas].sort((a, b) => b - a))
    })

    it('should dress the trail in the colour the orbital wears elsewhere', () => {
      const { r, g, b } = new Color('#0089bc')

      ellipse = new Ellipse({ ...data[0], labelColor: '#0089bc' })
      ellipse.updateTime(1)

      ellipse.getTrailingPathColors().forEach(([red, green, blue]) => {
        expect([red, green, blue]).toEqual([r, g, b])
      })
    })
  })
})
