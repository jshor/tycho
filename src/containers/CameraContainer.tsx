import React from 'react';
import { Scene, Object3D, PerspectiveCamera } from 'three';
import CameraService from '../services/CameraService';
import Controls from '../utils/Controls';
import Ambience from '../utils/Ambience';
import Constants from '../constants';
import { OrbitalData } from '../types';

export interface CameraAction {
    setUIControls: (enabled: boolean) => void;
    setPlaying: (enabled: boolean) => void;
    changeZoom: (level: number) => void;
}

interface Props {
    ratio: number;
    targetId?: string;
    speed?: number;
    scale?: number;
    zoom?: number;
    volume?: number;
    scene?: Scene;
    isAutoOrbitEnabled?: boolean;
    orbitalData?: OrbitalData[];
    domElement?: HTMLElement;
    action?: CameraAction;
}

export default class CameraContainer extends React.Component<Props> {

    ambience: Ambience;
    controls: Controls;
    tweenBase: { stop(): void };

    componentDidMount = () => {
        this.ambience = new Ambience((this.refs as unknown as { camera: PerspectiveCamera }).camera);
    }

    componentWillUnmount = () => {
        this.controls.dispose();
        delete this.controls;
    }

    componentWillReceiveProps = (nextProps: Props) => {
        this.maybeSetVolume(nextProps);
        this.maybeCreateControls(nextProps);
        this.maybeMoveCameraPivot(nextProps);
        this.maybeUpdateControlsZoom(nextProps);
        this.maybeUpdateAutoOrbit(nextProps);
        this.maybePreventCameraCollision(nextProps);
    }

    update = () => {
        if (this.controls) {
            this.controls.update();
        }
    }

    maybeSetVolume = ({ volume }: Props) => {
        if (this.props.volume !== volume) {
            this.ambience.setVolume(volume);
        }
    }

    maybeCreateControls = ({ domElement }: Props) => {
        if (this.props.domElement !== domElement) {
            this.controls = new Controls((this.refs as unknown as { camera: PerspectiveCamera }).camera, domElement);
        }
    }

    maybeMoveCameraPivot = ({ targetId }: Props) => {
        if (this.props.targetId !== targetId) {
            this.movePivot(targetId, !!this.props.targetId);
        }
    }

    maybePreventCameraCollision = ({ targetId, scale }: Props) => {
        if (this.props.targetId !== targetId || this.props.scale !== scale) {
            this.controls.minDistance = CameraService
                .getMinDistance(this.props.orbitalData, targetId, scale);
        }
    }

    maybeUpdateControlsZoom = ({ zoom }: Props) => {
        if (this.props.zoom !== zoom) {
            this.controls.zoom(zoom);
        }
    }

    maybeUpdateAutoOrbit = ({ isAutoOrbitEnabled }: Props) => {
        if (this.props.isAutoOrbitEnabled !== isAutoOrbitEnabled) {
            this.controls.autoRotate = isAutoOrbitEnabled;
        }
    }

    movePivot = (targetId: string, animate: boolean) => {
        const { scene } = this.props;
        const pivot = (this.refs as unknown as { pivot: Object3D }).pivot;
        const target = scene.getObjectByName(targetId);

        if (target && animate) {
            this.setInteractivity(false);
            this.startTween(target, pivot, scene);
        }
    }

    cancelTween = () => {
        if (this.tweenBase) {
            this.tweenBase.stop();
            delete this.tweenBase;
        }
    }

    endTween = () => this.setInteractivity(true)

    startTween = (target: Object3D, pivot: Object3D, scene: Scene) => {
        const v = CameraService.getWorldPosition(target);
        const w = CameraService.getWorldPosition(pivot);

        CameraService.attachToWorld(scene, pivot, w);

        this.cancelTween();
        this.zoomInFull();

        this.tweenBase = CameraService.getPivotTween(w, v, target, pivot, this.endTween);
    }

    setInteractivity = (enabled: boolean) => {
        this.props.action.setUIControls(!!enabled);
        this.props.action.setPlaying(enabled);
        this.controls.enabled = !!enabled;
    }

    zoomInFull = () => {
        this.controls.tweenZoom(Constants.WebGL.Zoom.MIN, this.props.action.changeZoom);
    }

    render() {
        return (
            <group ref="pivot">
                <perspectiveCamera
                    name="camera"
                    ref="camera"
                    aspect={this.props.ratio}
                    fov={Constants.WebGL.Camera.FOV}
                    near={Constants.WebGL.Camera.NEAR}
                    far={Constants.WebGL.Camera.FAR}
                    position={CameraService.CAMERA_INITIAL_POSITION}
                />
            </group>
        );
    }
}
