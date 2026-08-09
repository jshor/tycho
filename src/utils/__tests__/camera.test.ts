import { Vector3, Object3D, Scene } from 'three'
import { Tween } from '@tweenjs/tween.js'
import {
  attachToGyroscope,
  attachToWorld,
  getApproach,
  getMinDistance,
  getPivotTween,
  getWorldPosition,
  setPivotPosition
} from '../camera'
import { Gyroscope } from '../../elements/gyroscope'
import { tweens } from '../tween'
import { Scale } from '../scale'
import { Constants } from '../../constants'

describe('Camera Service', () => {
  describe('getPivotTween()', () => {
    const duration = Constants.WebGL.Tween.SLOW
    const offset = 1
    let scene: Scene
    let pivot: Object3D
    let target: Object3D

    const movePosition = (onMovePosition = vi.fn(), onDone = vi.fn()) => {
      return getPivotTween(new Vector3(), target, pivot, offset, onMovePosition, onDone)
        .stop()
        .start(0)
    }

    beforeEach(() => {
      tweens.removeAll()

      scene = new Scene()
      pivot = new Object3D()
      target = new Object3D()

      scene.add(pivot, target)
      target.position.set(100, 0, 0)
    })

    it('should return a new instance of Tween', () => {
      const tween = movePosition()

      expect(tween).toBeDefined()
      expect(tween).toBeInstanceOf(Tween)
    })

    it('should hand the tween to the group that drives them, or it would never run', () => {
      const tween = movePosition()

      expect(tweens.getAll()).toContain(tween)
    })

    it('should fly the pivot the whole way over to its target', () => {
      const tween = movePosition()

      tween.update(duration - 1)

      expect(pivot.position.x).toBeCloseTo(100)
    })

    it('should land on an orbital that carried on along its orbit during the flight', () => {
      const tween = movePosition()

      tween.update(duration / 2)
      target.position.set(0, 0, 400)
      tween.update(duration - 1)

      expect(pivot.position.x).toBeCloseTo(0)
      expect(pivot.position.z).toBeCloseTo(400)
    })

    it('should report how far along the flight is, so the camera can turn onto its target', () => {
      const onMovePosition = vi.fn()
      const tween = movePosition(onMovePosition)

      tween.update(duration / 2)

      const midway = onMovePosition.mock.calls.at(-1)?.[0]

      tween.update(duration)

      expect(midway).toBeGreaterThan(0)
      expect(midway).toBeLessThan(1)
      expect(onMovePosition.mock.calls.at(-1)?.[0]).toEqual(1)
    })

    const slice = (tween: Tween, part: number) => {
      tween.update(duration * (part - 0.1))

      const from = pivot.position.x

      tween.update(duration * part)

      return pivot.position.x - from
    }

    it('should pull away from the orbital it is leaving before gathering pace', () => {
      const tween = movePosition()

      expect(slice(tween, 0.1)).toBeLessThan(slice(tween, 0.3))
    })

    it('should slow again onto the orbital it is making for', () => {
      const tween = movePosition()

      expect(slice(tween, 0.9)).toBeLessThan(slice(tween, 0.7))
    })

    it('should hand the pivot over to the target once it arrives', () => {
      const onDone = vi.fn()
      const tween = movePosition(vi.fn(), onDone)

      tween.update(duration)

      expect(target.children[0]).toBeInstanceOf(Gyroscope)
      expect(pivot.position).toEqual(new Vector3(0, 0, 0))
      expect(onDone).toHaveBeenCalledTimes(1)
    })
  })

  describe('getApproach()', () => {
    const distance = 1000
    const offset = 0.01

    const left = (progress: number) => distance * (1 - getApproach(distance, offset, progress))

    it('should set out with all of the ground ahead of it and end up on the target', () => {
      expect(getApproach(distance, offset, 0)).toBeCloseTo(0)
      expect(getApproach(distance, offset, 1)).toEqual(1) // exactly, so it lands
    })

    it('should draw the target in at a steady rate rather than in a rush at the end', () => {
      const early = Math.log(left(0.2) / left(0.4))
      const late = Math.log(left(0.4) / left(0.6))

      expect(early).toBeCloseTo(late, 1)
    })

    it('should cover less and less ground the nearer it gets', () => {
      expect(left(0.2) - left(0.4)).toBeGreaterThan(left(0.6) - left(0.8))
    })

    it('should even out again once nearer than the camera means to come to rest', () => {
      const near = distance * (1 - getApproach(distance, distance, 0.5))

      expect(near / distance).toBeGreaterThan(0.4) // no magnifying left to do, so no rush to slow
    })

    it('should stay put when there is nowhere to go', () => {
      expect(getApproach(0, offset, 0.5)).toEqual(1)
    })

    it('should cope with a camera that may come to rest on the target itself', () => {
      const result = getApproach(distance, 0, 0.5)

      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(1)
    })
  })

  describe('setPivotPosition()', () => {
    it('should reset the pivot position to the given vector', () => {
      const x = 1
      const y = 2
      const z = 3
      const pivot = new Object3D()
      const spy = vi.spyOn(pivot.position, 'set')

      setPivotPosition(pivot, { x, y, z })

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
      const result = getWorldPosition(object)

      expect(result).toBeInstanceOf(Vector3)
    })

    it('should return the world position of a given object', () => {
      const result = getWorldPosition(object)

      expect(result).toEqual(position)
    })
  })

  describe('getMinDistance()', () => {
    const { MINIMUM_RADIUS } = Constants.WebGL
    const { FOV, FOCUS_FILL } = Constants.WebGL.Camera
    const framing = (radius: number, aspect = 1) => {
      const vertical = (FOV * Math.PI) / 180
      const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

      return Scale(radius) / Math.sin((field * FOCUS_FILL) / 2)
    }

    it('should frame the orbital to fill the given portion of the camera field', () => {
      const radius = MINIMUM_RADIUS * 5

      expect(getMinDistance(radius, 1)).toBeCloseTo(framing(radius))
    })

    it('should floor a small orbital to the minimum radius so the camera clears its inflated body', () => {
      expect(getMinDistance(1, 1)).toBeCloseTo(framing(MINIMUM_RADIUS))
    })

    it('should show a large orbital at the same size on screen as a small one', () => {
      const near = getMinDistance(MINIMUM_RADIUS, 1)
      const far = getMinDistance(MINIMUM_RADIUS * 11, 1)

      expect(far / near).toBeCloseTo(11)
    })

    it('should stand further off on a screen narrower than the camera field', () => {
      const wide = getMinDistance(MINIMUM_RADIUS, 16 / 9)
      const tall = getMinDistance(MINIMUM_RADIUS, 9 / 16)

      expect(tall).toBeGreaterThan(wide)
    })
  })

  describe('attachToWorld()', () => {
    const scene = new Scene()
    const pivot = new Object3D()
    const position = new Vector3(1, 2, 3)

    beforeEach(() => {
      attachToWorld(scene, pivot, position)
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
      attachToGyroscope(target, pivot, callback)
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
