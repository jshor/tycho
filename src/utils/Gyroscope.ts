import * as THREE from 'three';

export default class Gyroscope extends THREE.Object3D {

    translationWorld: THREE.Vector3 = new THREE.Vector3();
    translationObject: THREE.Vector3 = new THREE.Vector3();
    quaternionWorld: THREE.Quaternion = new THREE.Quaternion();
    quaternionObject: THREE.Quaternion = new THREE.Quaternion();
    scaleWorld: THREE.Vector3 = new THREE.Vector3();
    scaleObject: THREE.Vector3 = new THREE.Vector3();

    updateMatrixWorld = (force?: boolean): void => {
        this.maybeAutoUpdateMatrix();

        if (this.matrixWorldNeedsUpdate || force) {
            this.assignMatrixWorld();
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }

        this.updateChildrenMatrixWorlds(force);
    }

    maybeAutoUpdateMatrix = (): void => {
        if (this.matrixAutoUpdate) {
            this.updateMatrix();
        }
    }

    updateChildrenMatrixWorlds = (force?: boolean): void => {
        for (let i = 0; i < this.children.length; i++) {
            (this.children[i] as any).updateMatrixWorld(force);
        }
    }

    assignMatrixWorld = (): void => {
        if (this.parent) {
            this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
            this.matrixWorld.decompose(this.translationWorld, this.quaternionWorld, this.scaleWorld);
            this.matrix.decompose(this.translationObject, this.quaternionObject, this.scaleObject);
            this.matrixWorld.compose(this.translationWorld, this.quaternionObject, this.scaleWorld);
        } else {
            this.matrixWorld.copy(this.matrix);
        }
    }
}
