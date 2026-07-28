import { Vector3, Object3D, Scene } from 'three'
import TWEEN from 'tween.js'
import { CameraService } from '../CameraService'
import { Gyroscope } from '../../utils/Gyroscope'
import { Scale } from '../../utils/Scale'
import { Constants } from '../../constants'
import fixture from './__fixtures__/planets.json'

describe('Camera Service', () => {
  describe('getPivotTween()', () => {
    it('should return a new instance of Tween', () => {
      const tween = CameraService.getPivotTween(
        new Vector3(),
        new Vector3(1, 1, 1),
        new Object3D(),
        new Object3D(),
        vi.fn()
      )

      expect(tween).toBeDefined()
      expect(tween).toBeInstanceOf(TWEEN.Tween)
    })
  })

  describe('setPivotPosition()', () => {
    it('should reset the pivot position to the given vector', () => {
      const x = 1
      const y = 2
      const z = 3
      const pivot = new Object3D()
      const spy = vi.spyOn(pivot.position, 'set')

      CameraService.setPivotPosition(pivot, { x, y, z })

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(x, y, z)
    })
  })

  describe('getWorldPosition()', () => {
    const scene = new Scene()
    const object = new Object3D()
    const position = new Vector3(5, 6, 1)

    beforeEach(() => {
      scene.add(object)
      object.position.copy(position)
    })

    it('should be an instance of Vector3', () => {
      const result = CameraService.getWorldPosition(object)

      expect(result).toBeInstanceOf(Vector3)
    })

    it('should return the world position of a given object', () => {
      const result = CameraService.getWorldPosition(object)

      expect(result).toEqual(position)
    })
  })

  describe('getMinDistance()', () => {
    const { MINIMUM_RADIUS } = Constants.WebGL
    const { MIN_DISTANCE, FOV, FOCUS_FILL } = Constants.WebGL.Camera
    const framing = (radius: number, aspect = 1) => {
      const vertical = (FOV * Math.PI) / 180
      const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

      return Scale(radius) / Math.sin((field * FOCUS_FILL) / 2)
    }

    it('should floor a small orbital to the minimum radius so the camera clears its inflated body', () => {
      expect(CameraService.getMinDistance(fixture, 'Earth')).toBeCloseTo(framing(MINIMUM_RADIUS))
    })

    it('should stand off a ringed orbital far enough to take in its rings', () => {
      const outerRadius = 120700
      const ringed = [{ ...fixture[1], id: 'Ringed', rings: { outerRadius } }]

      expect(CameraService.getMinDistance(ringed as never, 'Ringed')).toBeCloseTo(
        framing(outerRadius)
      )
    })

    it('should show a large orbital at the same size on screen as a small one', () => {
      const small = [{ ...fixture[1], id: 'Small', radius: MINIMUM_RADIUS }]
      const large = [{ ...fixture[1], id: 'Large', radius: MINIMUM_RADIUS * 11 }]

      const near = CameraService.getMinDistance(small as never, 'Small')
      const far = CameraService.getMinDistance(large as never, 'Large')

      expect(far / near).toBeCloseTo(11)
    })

    it('should stand further off on a screen narrower than the camera field', () => {
      const wide = CameraService.getMinDistance(fixture, 'Earth', 16 / 9)
      const tall = CameraService.getMinDistance(fixture, 'Earth', 9 / 16)

      expect(tall).toBeGreaterThan(wide)
    })

    it('should fall back to the closest the camera may ever get if there is no target', () => {
      expect(CameraService.getMinDistance(fixture, 'Bogus')).toEqual(MIN_DISTANCE)
    })
  })

  describe('attachToWorld()', () => {
    const scene = new Scene()
    const pivot = new Object3D()
    const position = new Vector3(1, 2, 3)

    beforeEach(() => {
      CameraService.attachToWorld(scene, pivot, position)
    })

    it('should add the given pivot to the scene', () => {
      expect(scene.children).toContainEqual(pivot)
    })

    it('should set the position of the pivot to the given vector', () => {
      expect(pivot.position).toEqual(position)
    })
  })

  describe('attachToGyroscope()', () => {
    const target = new Object3D()
    const pivot = new Object3D()
    const callback = vi.fn()

    beforeEach(() => {
      CameraService.attachToGyroscope(target, pivot, callback)
    })

    it('should add a gyroscope to the given target', () => {
      expect(target.children).toHaveLength(1)
      expect(target.children[0]).toBeInstanceOf(Gyroscope)
    })

    it('should set the position of the pivot to <0>', () => {
      expect(pivot.position).toEqual(new Vector3(0, 0, 0))
    })
  })
})
