import type { MockInstance } from 'vitest'
import { Gyroscope } from '../gyroscope'
import * as THREE from 'three'

describe('Gyroscope', () => {
  let gyroscope: Gyroscope

  beforeEach(() => {
    gyroscope = new Gyroscope()
  })

  describe('updateMatrixWorld()', () => {
    it('should call maybeAutoUpdateMatrix()', () => {
      const spy = vi.spyOn(gyroscope, 'assignMatrixWorld')

      gyroscope.updateMatrixWorld()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    const updateMatrixWorldTests = (matrixWorldNeedsUpdate: boolean, force: boolean) => {
      beforeEach(() => {
        gyroscope.matrixWorldNeedsUpdate = matrixWorldNeedsUpdate
      })

      it('should call assignMatrixWorld()', () => {
        const spy = vi.spyOn(gyroscope, 'assignMatrixWorld')

        gyroscope.updateMatrixWorld(force)

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
      })

      it('should assign the matrixWorldNeedsUpdate to false', () => {
        gyroscope.updateMatrixWorld(force)

        expect(gyroscope.matrixWorldNeedsUpdate).toEqual(false)
      })

      it('should call updateChildrenMatrixWorlds with force = true', () => {
        const spy = vi.spyOn(gyroscope, 'updateChildrenMatrixWorlds')

        gyroscope.updateMatrixWorld(force)

        expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(true)
      })
    }

    describe('when matrixWorldNeedsUpdate flag is true', () => {
      updateMatrixWorldTests(true, false)
    })

    describe('when force flag is true', () => {
      updateMatrixWorldTests(false, true)
    })

    describe('when both the force and the matrixWorldNeedsUpdate flags are false', () => {
      it('should not call assignMatrixWorld()', () => {
        const spy = vi.spyOn(gyroscope, 'assignMatrixWorld')

        gyroscope.maybeAutoUpdateMatrix = vi.fn()
        gyroscope.matrixWorldNeedsUpdate = false
        gyroscope.updateMatrixWorld(false)

        expect(spy).not.toHaveBeenCalled()
      })
    })
  })

  describe('maybeAutoUpdateMatrix()', () => {
    let spy: MockInstance

    beforeEach(() => {
      spy = vi.spyOn(gyroscope, 'updateMatrix')
    })

    it('should call updateMatrix() if the matrixAutoUpdate flag is true', () => {
      gyroscope.matrixAutoUpdate = true
      gyroscope.maybeAutoUpdateMatrix()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call updateMatrix() if the matrixAutoUpdate flag is false', () => {
      gyroscope.matrixAutoUpdate = false
      gyroscope.maybeAutoUpdateMatrix()

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('updateChildrenMatrixWorlds()', () => {
    it('should call updateMatrixWorld() on its children', () => {
      const child = new THREE.Object3D()
      const spy = vi.spyOn(child, 'updateMatrixWorld')

      gyroscope.add(child)
      gyroscope.updateChildrenMatrixWorlds()

      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateWorldMatrix()', () => {
    const createSpinningObject = () => {
      const body = new THREE.Object3D()
      const rider = new THREE.Object3D()

      body.rotation.set(0.4, 1.1, 0.7)
      body.add(gyroscope)
      gyroscope.add(rider)
      body.updateMatrixWorld(true)

      return { body, rider }
    }

    /** The pivot for the given object in the world. */
    const bearingOf = (object: THREE.Object3D) => {
      const quaternion = new THREE.Quaternion()

      object.matrixWorld.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3())

      return quaternion
    }

    it('should hold its bearing rather than taking the body it stands on with it', () => {
      const { body } = createSpinningObject()

      gyroscope.updateWorldMatrix(true, false)

      // the plain Object3D version would have handed the body's own turn straight through
      expect(bearingOf(gyroscope).angleTo(new THREE.Quaternion())).toBeCloseTo(0)
      expect(bearingOf(body).angleTo(new THREE.Quaternion())).toBeGreaterThan(0)
    })

    it('should hold that bearing for anything reaching down through it', () => {
      const { rider } = createSpinningObject()

      // this is the call `getWorldPosition()` and `getWorldQuaternion()` make on the way up
      rider.updateWorldMatrix(true, false)

      expect(bearingOf(rider).angleTo(new THREE.Quaternion())).toBeCloseTo(0)
    })

    it('should still ride the body it stands on', () => {
      const { body } = createSpinningObject()

      body.position.set(3, 4, 5)
      body.updateMatrixWorld(true)
      gyroscope.updateWorldMatrix(true, false)

      expect(new THREE.Vector3().setFromMatrixPosition(gyroscope.matrixWorld)).toEqual(
        new THREE.Vector3(3, 4, 5)
      )
    })

    it('should leave the parents alone when it is not asked to walk up', () => {
      const { body } = createSpinningObject()
      const spy = vi.spyOn(body, 'updateWorldMatrix')

      gyroscope.updateWorldMatrix(false, false)

      expect(spy).not.toHaveBeenCalled()
    })

    it('should pass the update on down when it is asked to', () => {
      const { rider } = createSpinningObject()
      const spy = vi.spyOn(rider, 'updateWorldMatrix')

      gyroscope.updateWorldMatrix(false, true)

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('assignMatrixWorld()', () => {
    it("should copy an instance of the parent's Object3D if gyroscope is a child of it", () => {
      const parent = new THREE.Object3D()

      parent.add(gyroscope)
      gyroscope.assignMatrixWorld()

      expect(gyroscope.matrixWorld).toBeInstanceOf(THREE.Matrix4)
    })

    it('should clone the matrixWorld of its current matrix if it is not a child of an Object3D', () => {
      const currentMatrix = gyroscope.matrix

      gyroscope.assignMatrixWorld()

      expect(gyroscope.matrixWorld).toEqual(currentMatrix)
    })
  })
})
