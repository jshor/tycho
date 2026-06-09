import * as THREE from 'three';

export default class Gyroscope extends THREE.Object3D {

    /**
     * Updates matrix world.
     *
     * @param {Boolean} force - set to true to force update
     */
    updateMatrixWorld = (force) => {
        this.maybeAutoUpdateMatrix();

        if (this.matrixWorldNeedsUpdate || force) {
            this.assignMatrixWorld();
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }

        this.updateChildrenMatrixWorlds(force);
    }

    /**
     * Updates matrix if the matrixAutoUpdate flag is true.
     */
    maybeAutoUpdateMatrix = () => {
        if (this.matrixAutoUpdate) {
            this.updateMatrix();
        }
    }

    /**
     * Updates world matrices of all children.
     *
     * @param {Boolean} force - set to true to force update
     */
    updateChildrenMatrixWorlds = (force) => {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateMatrixWorld(force);
        }
    }

    /**
     * Assigns the matrix world with the matrix from the ancestor context.
     * When a parent exists, clone it and normalize it so that the object is level.
     * When the context is parentless, it will use its existing matrix.
     */
    assignMatrixWorld = () => {
        if (this.parent) {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            this.matrixWorld.decompose(this.translationWorld, this.quaternionWorld, this.scaleWorld);
            this.matrix.decompose(this.translationObject, this.quaternionObject, this.scaleObject);
            this.matrixWorld.compose(this.translationWorld, this.quaternionObject, this.scaleWorld);
        } else {
            this.matrixWorld.copy(this.matrix);
        }
    }

    /**
     * Standard Object3D properties
     */
    translationWorld = new THREE.Vector3();
    translationObject = new THREE.Vector3();
    quaternionWorld = new THREE.Quaternion();
    quaternionObject = new THREE.Quaternion();
    scaleWorld = new THREE.Vector3();
    scaleObject = new THREE.Vector3();
}

