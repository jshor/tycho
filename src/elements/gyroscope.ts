import * as THREE from 'three'

/**
 * A scene object that can be placed onto a parent and will follow the parent's position.
 */
export class Gyroscope extends THREE.Object3D {
  /** The position decomposed out of the world matrix. */
  translationWorld: THREE.Vector3 = new THREE.Vector3()

  /** The position decomposed out of this object's own matrix. */
  translationObject: THREE.Vector3 = new THREE.Vector3()

  /** The rotation decomposed out of the world matrix, which the parent's turning carries with it. */
  quaternionWorld: THREE.Quaternion = new THREE.Quaternion()

  /** The rotation decomposed out of this object's own matrix, which is the one it keeps. */
  quaternionObject: THREE.Quaternion = new THREE.Quaternion()

  /** The scale decomposed out of the world matrix. */
  scaleWorld: THREE.Vector3 = new THREE.Vector3()

  /** The scale decomposed out of this object's own matrix. */
  scaleObject: THREE.Vector3 = new THREE.Vector3()

  /**
   * Rebuilds the world matrix whenever it has fallen out of date, then passes the update on down.
   */
  updateMatrixWorld = (force?: boolean): void => {
    this.maybeAutoUpdateMatrix()

    if (this.matrixWorldNeedsUpdate || force) {
      this.assignMatrixWorld()
      this.matrixWorldNeedsUpdate = false
      force = true
    }

    this.updateChildrenMatrixWorlds(force)
  }

  /**
   * Rebuilds the world matrix.
   */
  updateWorldMatrix = (updateParents?: boolean, updateChildren?: boolean): void => {
    if (updateParents && this.parent) {
      this.parent.updateWorldMatrix(true, false)
    }

    this.maybeAutoUpdateMatrix()
    this.assignMatrixWorld()

    if (updateChildren) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateWorldMatrix(false, true)
      }
    }
  }

  /**
   * Refreshes the local matrix when this object is set to keep it up to date itself.
   */
  maybeAutoUpdateMatrix = (): void => {
    if (this.matrixAutoUpdate) {
      this.updateMatrix()
    }
  }

  /**
   * Passes the world matrix update down to every child.
   */
  updateChildrenMatrixWorlds = (force?: boolean): void => {
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateMatrixWorld(force)
    }
  }

  /**
   * Composes the world matrix from where the parent puts this object, at the rotation it holds.
   */
  assignMatrixWorld = (): void => {
    if (this.parent) {
      this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)
      this.matrixWorld.decompose(this.translationWorld, this.quaternionWorld, this.scaleWorld)
      this.matrix.decompose(this.translationObject, this.quaternionObject, this.scaleObject)
      this.matrixWorld.compose(this.translationWorld, this.quaternionObject, this.scaleWorld)
    } else {
      this.matrixWorld.copy(this.matrix)
    }
  }
}
