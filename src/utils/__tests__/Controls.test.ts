import type { MockInstance } from 'vitest'
import TWEEN from 'tween.js'
import { Camera, Vector3 } from 'three'
import { Controls } from '../Controls'
import { Constants } from '../../constants'

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

  describe('setMinDistance()', () => {
    beforeEach(() => {
      controls.camera.position.set(0, 0, 10)
    })

    it('should pull the camera in to the new limit', () => {
      controls.setMinDistance(2)
      controls.zoom(0)

      expect(controls.camera.position.length()).toBeCloseTo(2)
    })

    it('should re-frame a camera already sitting at the old limit, whose zoom has not changed', () => {
      controls.setMinDistance(8)
      controls.zoom(0)

      expect(controls.camera.position.length()).toBeCloseTo(8)

      controls.setMinDistance(2)

      expect(controls.level).toEqual(0)
      expect(controls.camera.position.length()).toBeCloseTo(2)
    })

    it('should re-scale a camera part-way in, since the near limit anchors the zoom scale', () => {
      controls.minDistance = 1
      controls.maxDistance = 10000
      controls.zoom(50)

      expect(controls.camera.position.length()).toBeCloseTo(100)

      controls.setMinDistance(100)

      expect(controls.camera.position.length()).toBeCloseTo(1000)
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

      controls.tweenBase = new TWEEN.Tween({})
      controls.tweenData = { level: 0 }
      controls.completeTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('cancelTween()', () => {
    it('should stop the active tween', () => {
      controls.tweenBase = new TWEEN.Tween({})
      const spy = vi.spyOn(controls.tweenBase, 'stop')

      controls.cancelTween()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call endTween', () => {
      const spy = vi.spyOn(controls, 'endTween')

      controls.tweenBase = new TWEEN.Tween({})
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

    it('should assign a new tween to tweenBase', () => {
      const tween = new TWEEN.Tween()

      controls.tweenBase = tween
      controls.tweenZoom(50, vi.fn())

      expect(controls).toHaveProperty('tweenBase')
      expect(controls.tweenBase).toBeInstanceOf(TWEEN.Tween)
    })
  })

  describe('wheelZoom()', () => {
    let action: { changeZoom: (zoom: number) => void }
    let spy: MockInstance

    beforeEach(() => {
      action = { changeZoom: vi.fn() }
      spy = vi.spyOn(action, 'changeZoom')
    })

    it('should call the given action callback with the calculated zoom, if changed', () => {
      const newZoom = 20

      controls.getZoomDelta = () => newZoom
      controls.wheelZoom({ deltaY: 0 }, action.changeZoom)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(newZoom)
    })

    it('should not call the given callback if the zoom stays the same', () => {
      const newZoom = 20

      controls.getZoomDelta = () => newZoom
      controls.level = newZoom / 100
      controls.wheelZoom({ deltaY: 0 }, action.changeZoom)

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('pinchZoom()', () => {
    let action: { changeZoom: (zoom: number) => void }
    let spy: MockInstance

    beforeEach(() => {
      action = { changeZoom: vi.fn() }
      spy = vi.spyOn(action, 'changeZoom')
    })

    it('should zoom in when the fingers spread apart', () => {
      const level = controls.level

      controls.pinchZoom(10, action.changeZoom)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toBeLessThan(level)
    })

    it('should zoom out when the fingers come together', () => {
      controls.level = 50

      controls.pinchZoom(-10, action.changeZoom)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy.mock.calls[0][0]).toBeGreaterThan(50)
    })

    it('should zoom by the same amount the wheel would for an equivalent delta', () => {
      const separation = 10
      const wheeled = controls.getZoomDelta(-separation * Constants.UI.PINCH_DELTA_SCALE)

      controls.pinchZoom(separation, action.changeZoom)

      expect(spy).toHaveBeenCalledWith(wheeled)
    })

    it('should not zoom past the closest the camera may get', () => {
      controls.level = 0

      controls.pinchZoom(1000, action.changeZoom)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should not zoom past the furthest the camera may get', () => {
      controls.level = Constants.WebGL.Zoom.MAX

      controls.pinchZoom(-1000, action.changeZoom)

      expect(spy).toHaveBeenCalledWith(Constants.WebGL.Zoom.MAX)
    })
  })
})
