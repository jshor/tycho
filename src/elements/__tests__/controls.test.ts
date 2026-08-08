import type { MockInstance } from 'vitest'
import { Tween } from '@tweenjs/tween.js'
import { tweens } from '../../utils/tween'
import { Camera, Vector3 } from 'three'
import { Controls } from '../controls'
import { Constants } from '../../constants'

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
  OrbitControls: class {
    constructor(protected camera: Camera) {}

    update = vi.fn()
    dispose = vi.fn()
    touches = {
      ONE: 3,
      TWO: 3
    }
  }
}))

describe('Controls', () => {
  let camera: Camera
  let controls: Controls

  beforeEach(() => {
    camera = new Camera()
    controls = new Controls(camera, document.createElement('canvas'))
  })

  describe('zoom()', () => {
    describe('when the zoom level has changed', () => {
      const newLevel = 50
      let spy: MockInstance

      beforeEach(() => {
        spy = vi.spyOn(controls, 'pan')
        controls.level = 60
        controls.zoom(newLevel)
      })

      it('should update the `level` property to the new zoom and pan', () => {
        expect(typeof controls.level).toBe('number')
        expect(controls.level).toEqual(newLevel)
      })

      it('should call pan with the new level', () => {
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(newLevel)
      })
    })

    describe('when the zoom level has not changed', () => {
      it('should not change the `level` property', () => {
        const oldLevel = 50
        controls.level = oldLevel

        controls.zoom(oldLevel)

        expect(typeof controls.level).toBe('number')
        expect(controls.level).toEqual(oldLevel)
      })
    })
  })

  describe('getZoomDelta()', () => {
    it('should calculate the proper zoom delta', () => {
      controls.level = 50
      const result = controls.getZoomDelta(-40)

      expect(typeof result).toBe('number')
      expect(result).toEqual(49.6)
    })

    it('should step by the same amount of level wherever the camera sits', () => {
      controls.level = 90
      const far = controls.getZoomDelta(-100)

      controls.level = 10
      const near = controls.getZoomDelta(-100)

      expect(90 - far).toBeCloseTo(10 - near)
    })

    it('should not zoom past either limit', () => {
      controls.level = Constants.WebGL.Zoom.MIN

      expect(controls.getZoomDelta(-100000)).toEqual(Constants.WebGL.Zoom.MIN)

      controls.level = Constants.WebGL.Zoom.MAX

      expect(controls.getZoomDelta(100000)).toEqual(Constants.WebGL.Zoom.MAX)
    })
  })

  describe('getZoomDistance()', () => {
    beforeEach(() => {
      controls.minDistance = 1
      controls.maxDistance = 10000
    })

    it('should sit at the limits at either end of the scale', () => {
      expect(controls.getZoomDistance(Constants.WebGL.Zoom.MIN)).toBeCloseTo(1)
      expect(controls.getZoomDistance(Constants.WebGL.Zoom.MAX)).toBeCloseTo(10000)
    })

    it('should move the camera by the same ratio for every step of the level', () => {
      const near = controls.getZoomDistance(25) / controls.getZoomDistance(20)
      const far = controls.getZoomDistance(80) / controls.getZoomDistance(75)

      expect(near).toBeCloseTo(far)
    })

    it('should cover less ground per step the closer the camera gets', () => {
      const near = controls.getZoomDistance(25) - controls.getZoomDistance(20)
      const far = controls.getZoomDistance(80) - controls.getZoomDistance(75)

      expect(near).toBeLessThan(far)
    })
  })

  describe('pan()', () => {
    it('should set the camera position to the distance the given level stands off at', () => {
      controls.minDistance = 1
      controls.maxDistance = 10000
      controls.camera.position.set(0, 0, 5)
      controls.pan(50)

      expect(controls.camera.position).toBeInstanceOf(Vector3)
      expect(controls.camera.position.length()).toBeCloseTo(100)
    })

    it('should keep the camera pointed the way it already was', () => {
      const direction = new Vector3(1, 2, 3).normalize()

      controls.camera.position.set(1, 2, 3)
      controls.pan(50)

      expect(controls.camera.position.clone().normalize().x).toBeCloseTo(direction.x)
      expect(controls.camera.position.clone().normalize().y).toBeCloseTo(direction.y)
      expect(controls.camera.position.clone().normalize().z).toBeCloseTo(direction.z)
    })

    it('should not pan the camera nearer than the smallest distance allowed', () => {
      controls.minDistance = 1
      controls.camera.position.set(0, 0, 5)
      controls.pan(Constants.WebGL.Zoom.MIN)

      expect(controls.camera.position.length()).toBeCloseTo(1)
    })
  })

  describe('getZoomVector()', () => {
    it('should scale the given vector by the given scalar', () => {
      const vector = new Vector3(1, 2, 3)
      const scalar = 10

      controls.maxDistance = 4

      const result = controls.getZoomVector(vector, scalar)
      const expected = vector.normalize().multiplyScalar(scalar)

      expect(result).toBeInstanceOf(Vector3)
      expect(result.x).toEqual(expected.x)
      expect(result.y).toEqual(expected.y)
      expect(result.z).toEqual(expected.z)
    })
  })

  describe('getDistance()', () => {
    it('should return maxDistance minus minDistance', () => {
      controls.maxDistance = 10
      controls.minDistance = 3

      const result = controls.getDistance()

      expect(typeof result).toEqual('number')
      expect(result).toEqual(7)
    })
  })

  describe('faceTarget()', () => {
    it('should orient the camera to look at its local origin (the focused orbital), not the world origin', () => {
      controls.camera.position.set(10, 0, 0)
      controls.faceTarget()

      const forward = new Vector3(0, 0, -1).applyQuaternion(controls.camera.quaternion)
      const expected = controls.camera.position.clone().negate().normalize()

      expect(forward.x).toBeCloseTo(expected.x)
      expect(forward.y).toBeCloseTo(expected.y)
      expect(forward.z).toBeCloseTo(expected.z)
    })

    it('should leave the camera orientation untouched when it sits on the origin', () => {
      controls.camera.position.set(0, 0, 0)
      const original = controls.camera.quaternion.clone()

      controls.faceTarget()

      expect(controls.camera.quaternion.equals(original)).toBe(true)
    })

    it('should orient the camera onto whatever it has been turned toward', () => {
      const point = new Vector3(0, 0, 40)

      controls.camera.position.set(10, 0, 0)
      controls.lookToward(point, 1)
      controls.faceTarget()

      const forward = new Vector3(0, 0, -1).applyQuaternion(controls.camera.quaternion)
      const expected = point.clone().sub(controls.camera.position).normalize()

      expect(forward.x).toBeCloseTo(expected.x)
      expect(forward.y).toBeCloseTo(expected.y)
      expect(forward.z).toBeCloseTo(expected.z)
    })
  })

  describe('lookToward()', () => {
    const point = new Vector3(0, 0, 100)

    /** How far off the given point the camera is framed, once turned the given part of the way. */
    const turn = (blend: number) => {
      controls.lookToward(point, blend)
      controls.faceTarget()

      const forward = new Vector3(0, 0, -1).applyQuaternion(controls.camera.quaternion)

      return forward.angleTo(point.clone().sub(controls.camera.position))
    }

    /** How far off it the camera is while still framed on the origin of its own pivot. */
    const framed = () => {
      controls.resetLook()

      return turn(0)
    }

    beforeEach(() => {
      controls.camera.position.set(10, 0, 0)
    })

    it('should still be framed on its pivot at the outset of the flight', () => {
      expect(turn(0)).toBeCloseTo(framed())
    })

    it('should have come around onto the point by the end of the flight', () => {
      expect(turn(1)).toBeCloseTo(0)
    })

    it('should turn no further than onto the point, however far it is asked to', () => {
      expect(turn(4)).toBeCloseTo(0)
    })

    it('should sweep steadily around over the course of the flight', () => {
      const full = framed()
      const quarter = turn(0.25)
      const half = turn(0.5)
      const rest = turn(0.75)

      expect(quarter).toBeLessThan(full)
      expect(half).toBeLessThan(quarter)
      expect(rest).toBeLessThan(half)
      expect(half).toBeCloseTo(full / 2)
    })

    it('should ease into the turn rather than whip away from what it was framed on', () => {
      expect(turn(0.1)).toBeGreaterThan(framed() * 0.9)
    })

    it('should set out framed on its pivot when it was at rest, whatever the camera was left at', () => {
      controls.camera.quaternion.identity()
      controls.lockCameraOntoTarget()

      expect(controls.lookOrigin).toEqual(new Vector3(0, 0, 0))
    })

    it('should turn from where it left off, so a flight cut short by another does not snap', () => {
      const interrupted = turn(0.5)

      controls.lockCameraOntoTarget()
      controls.lookToward(new Vector3(0, 0, 200), 0)
      controls.faceTarget()

      const forward = new Vector3(0, 0, -1).applyQuaternion(controls.camera.quaternion)

      expect(forward.angleTo(point.clone().sub(controls.camera.position))).toBeCloseTo(interrupted)
    })
  })

  describe('resetLook()', () => {
    it('should frame the camera back on the origin of its own pivot', () => {
      controls.camera.position.set(10, 0, 0)
      controls.lookToward(new Vector3(0, 0, 100), 1)
      controls.lockCameraOntoTarget()
      controls.resetLook()
      controls.faceTarget()

      const forward = new Vector3(0, 0, -1).applyQuaternion(controls.camera.quaternion)

      expect(forward.x).toBeCloseTo(-1)
      expect(controls.focus).toEqual(new Vector3(0, 0, 0))
      expect(controls.lookOrigin).toEqual(new Vector3(0, 0, 0))
      expect(controls.lookPercentCompleted).toEqual(0)
    })
  })

  describe('enable()', () => {
    it('should set the controls to be enabled', () => {
      controls.enable()

      expect(typeof controls.enabled).toBe('boolean')
      expect(controls.enabled).toEqual(true)
    })
  })

  describe('disable()', () => {
    it('should set the controls to be disabled', () => {
      controls.disable()

      expect(typeof controls.enabled).toBe('boolean')
      expect(controls.enabled).toEqual(false)
    })
  })

  describe('startAutoRotate()', () => {
    it('should start autorotating the scene at the given speed', () => {
      const speed = 2

      controls.startAutoRotate(speed)

      expect(controls.autoRotate).toBe(true)
      expect(controls.autoRotateSpeed).toEqual(speed)
    })
  })

  describe('stopAutoRotate()', () => {
    it('should stop autorotating the scene', () => {
      controls.stopAutoRotate()

      expect(controls.autoRotate).toBe(false)
    })
  })

  describe('updateTween()', () => {
    it('should statically zoom to the current tween level', () => {
      const spy = vi.spyOn(controls, 'zoom')
      const level = 40

      controls.tweenData = { level }
      controls.updateTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(level)
    })
  })

  describe('endTween()', () => {
    it('should dispose of the tweenBase and tweenData objects', () => {
      const spy = vi.spyOn(controls, 'endTween')

      controls.tweenBase = new Tween({})
      controls.tweenData = { level: 0 }
      controls.completeTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('cancelTween()', () => {
    it('should stop the active tween', () => {
      controls.tweenBase = new Tween({})
      const spy = vi.spyOn(controls.tweenBase, 'stop')

      controls.cancelTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call endTween', () => {
      const spy = vi.spyOn(controls, 'endTween')

      controls.tweenBase = new Tween({})
      controls.cancelTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('completeTween()', () => {
    it('should invoke the tweenDone callback assignment, if exists', () => {
      controls.tweenDone = vi.fn()
      controls.tweenData = { level: 0 }

      const spy = vi.spyOn(controls, 'tweenDone')

      controls.completeTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call endTween()', () => {
      const spy = vi.spyOn(controls, 'endTween')

      controls.tweenData = { level: 0 }
      controls.completeTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('tweenZoom()', () => {
    it('should cancel any tween in progress', () => {
      const spy = vi.spyOn(controls, 'cancelTween')

      controls.tweenZoom(50, vi.fn())

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should assign the tween data to be the current zoom level', () => {
      controls.level = 100
      controls.tweenZoom(50, vi.fn())

      expect(controls).toHaveProperty('tweenData')
      expect(controls.tweenData).toHaveProperty('level')
      expect(controls.tweenData.level).toEqual(controls.level)
    })

    it('should hand the tween to the group that drives them, or it would never run', () => {
      controls.tweenZoom(50, vi.fn())

      expect(tweens.getAll()).toContain(controls.tweenBase)
    })

    it('should assign a new tween to tweenBase', () => {
      const tween = new Tween({})

      controls.tweenBase = tween
      controls.tweenZoom(50, vi.fn())

      expect(controls).toHaveProperty('tweenBase')
      expect(controls.tweenBase).toBeInstanceOf(Tween)
    })
  })
})
