import { Vector3, Object3D, Scene, MathUtils } from 'three'
import { Tween } from '@tweenjs/tween.js'
import {
  attachToGyroscope,
  attachToWorld,
  getApproach,
  getMinDistance,
  getNearPlane,
  getPivotTween,
  getSunlitHeading,
  getWorldPosition,
  setPivotPosition,
  turnHeading
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

  describe('getSunlitHeading()', () => {
    const target = new Vector3(100, 0, 0)
    const fallback = new Vector3(0, 0, 4)
    const sunward = new Vector3(-1, 0, 0)

    it('should watch the orbital from the side the sun shines on', () => {
      expect(getSunlitHeading(target, fallback).angleTo(sunward)).toBeLessThan(Math.PI / 2)
    })

    it('should stand off the sun-facing line, so the orbital reads as a sphere', () => {
      const heading = getSunlitHeading(target, fallback)
      const tilt = MathUtils.degToRad(Constants.WebGL.Camera.SUNLIT_TILT)

      expect(heading.angleTo(sunward)).toBeCloseTo(tilt)
      expect(tilt).toBeGreaterThan(0)
    })

    it('should hand back a heading of unit length, whatever the orbital sits at', () => {
      expect(getSunlitHeading(new Vector3(0, 300, -400), fallback).length()).toBeCloseTo(1)
    })

    it('should keep to the heading it was given for an orbital sat on the sun itself', () => {
      const heading = getSunlitHeading(new Vector3(), fallback)

      expect(heading.z).toBeCloseTo(1)
      expect(heading.length()).toBeCloseTo(1)
    })
  })

  describe('turnHeading()', () => {
    const from = new Vector3(0, 0, 1)
    const to = new Vector3(-1, 0, 0)

    it('should stay where it set off from before the turn has begun', () => {
      expect(turnHeading(from, to, 0).angleTo(from)).toBeCloseTo(0)
    })

    it('should arrive on the heading it was turning onto', () => {
      expect(turnHeading(from, to, 1).angleTo(to)).toBeCloseTo(0)
    })

    it('should turn evenly along the arc between the two', () => {
      const halfway = turnHeading(from, to, 0.5)

      expect(halfway.angleTo(from)).toBeCloseTo(from.angleTo(to) / 2)
      expect(halfway.angleTo(to)).toBeCloseTo(from.angleTo(to) / 2)
    })

    it('should hold its unit length the whole way round', () => {
      expect(turnHeading(new Vector3(0, 0, 9), to, 0.3).length()).toBeCloseTo(1)
    })

    it('should leave the headings it was handed alone', () => {
      turnHeading(from, to, 0.5)

      expect(from).toEqual(new Vector3(0, 0, 1))
      expect(to).toEqual(new Vector3(-1, 0, 0))
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
    const { FOV, FOCUS_FILL } = Constants.WebGL.Camera

    /** A mid-sized body to frame against, in km. */
    const RADIUS = 1000

    const framing = (radius: number, aspect = 1) => {
      const vertical = (FOV * Math.PI) / 180
      const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

      return Scale(radius) / Math.sin((field * FOCUS_FILL) / 2)
    }

    it('should frame the orbital to fill the given portion of the camera field', () => {
      const radius = RADIUS * 5

      expect(getMinDistance(radius, 1)).toBeCloseTo(framing(radius))
    })

    it('should frame the smallest orbital at its own size, without a floor beneath it', () => {
      expect(getMinDistance(1, 1)).toBeCloseTo(framing(1))
    })

    it('should close right in on a tiny moon rather than standing off its inflated body', () => {
      expect(getMinDistance(11.2667, 1)).toBeLessThan(getMinDistance(RADIUS, 1))
    })

    it('should show a large orbital at the same size on screen as a small one', () => {
      const near = getMinDistance(RADIUS, 1)
      const far = getMinDistance(RADIUS * 11, 1)

      expect(far / near).toBeCloseTo(11)
    })

    it('should hold that proportion right down to the smallest bodies', () => {
      const moon = getMinDistance(6.2, 1)
      const planet = getMinDistance(62, 1)

      expect(planet / moon).toBeCloseTo(10)
    })

    it('should stand further off on a screen narrower than the camera field', () => {
      const wide = getMinDistance(RADIUS, 16 / 9)
      const tall = getMinDistance(RADIUS, 9 / 16)

      expect(tall).toBeGreaterThan(wide)
    })
  })

  describe('getNearPlane()', () => {
    const { FOCUS_FILL, FOV, NEAR, NEAR_MIN, NEAR_RATIO } = Constants.WebGL.Camera
    const PHOBOS_RADIUS = 11.2667
    const frameOn = (radius: number) => {
      const field = MathUtils.degToRad(FOV)

      return Scale(radius) / Math.sin((field * FOCUS_FILL) / 2)
    }

    it('should hold at the default when the camera is far from its target', () => {
      expect(getNearPlane(Constants.WebGL.Camera.MAX_DISTANCE, PHOBOS_RADIUS)).toBe(NEAR)
    })

    it('should never reach further out than the default', () => {
      expect(getNearPlane(Number.MAX_SAFE_INTEGER, PHOBOS_RADIUS)).toBe(NEAR)
    })

    it('should draw in proportionally as the camera closes on the surface', () => {
      const distance = Scale(PHOBOS_RADIUS) * 3
      const gap = distance - Scale(PHOBOS_RADIUS)

      expect(getNearPlane(distance, PHOBOS_RADIUS)).toBeCloseTo(gap * NEAR_RATIO, 12)
    })

    it('should measure the gap from the surface rather than the center', () => {
      const distance = Scale(PHOBOS_RADIUS) * 3

      expect(getNearPlane(distance, PHOBOS_RADIUS)).toBeLessThan(getNearPlane(distance))
    })

    it('should clear a tiny moon at true scale that the default plane would clip away', () => {
      const distance = frameOn(PHOBOS_RADIUS)
      const nearestSurface = distance - Scale(PHOBOS_RADIUS)

      // the default plane stands off further than the whole moon, so it would swallow it
      expect(NEAR).toBeGreaterThan(nearestSurface)
      expect(getNearPlane(distance, PHOBOS_RADIUS)).toBeLessThan(nearestSurface)
    })

    it('should not collapse below the floor that protects depth precision', () => {
      expect(getNearPlane(0, PHOBOS_RADIUS)).toBe(NEAR_MIN)
    })

    it('should hold at the floor when the camera is inside the body', () => {
      expect(getNearPlane(Scale(PHOBOS_RADIUS) / 2, PHOBOS_RADIUS)).toBe(NEAR_MIN)
    })

    it('should treat a target of no given radius as a point', () => {
      const distance = Scale(1000)

      expect(getNearPlane(distance)).toBeCloseTo(distance * NEAR_RATIO, 12)
    })

    it('should stay within the near plane bounds at every distance', () => {
      const distances = [0, 1e-8, 1e-5, 1e-3, 1, 100, Constants.WebGL.Camera.FAR]

      distances.forEach((distance) => {
        const near = getNearPlane(distance, PHOBOS_RADIUS)

        expect(near).toBeGreaterThanOrEqual(NEAR_MIN)
        expect(near).toBeLessThanOrEqual(NEAR)
      })
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
