import React from 'react';
import PropTypes from 'prop-types';
import CameraService from '../services/CameraService';
import Controls from '../utils/Controls';
import Ambience from '../utils/Ambience';
import Constants from '../constants';

export default class CameraContainer extends React.Component {

    static propTypes = {
        ratio: PropTypes.number.isRequired,
        targetId: PropTypes.string,
        actions: PropTypes.object,
        speed: PropTypes.number,
        scale: PropTypes.number,
        zoom: PropTypes.number,
        scene: PropTypes.object,
        isAutoOrbitEnabled: PropTypes.bool,
        orbitalData: PropTypes.array
    }

    componentDidMount = () => {
        this.ambience = new Ambience(this.refs.camera);
    }

    componentWillUnmount = () => {
        this.controls.dispose();
        delete this.controls;
    }

    componentWillReceiveProps = (nextProps) => {
        this.maybeSetVolume(nextProps);
        this.maybeCreateControls(nextProps);
        this.maybeMoveCameraPivot(nextProps);
        this.maybeUpdateControlsZoom(nextProps);
        this.maybeUpdateAutoOrbit(nextProps);
        this.maybePreventCameraCollision(nextProps);
    }

    /**
     * Updates controls, if mounted.
     */
    update = () => {
        if (this.controls) {
            this.controls.update();
        }
    }

    /**
     * Sets ambience volume.
     *
     * @param {Object} props
     * @param {Boolean} props.volume
     */
    maybeSetVolume = ({ volume }) => {
        if (this.props.volume !== volume) {
            this.ambience.setVolume(volume);
        }
    }

    /**
     * Re-renders controls with updated canvas DOM Element.
     *
     * @param {Object} props
     * @param {HTMLElement} props.domElement
     */
    maybeCreateControls = ({ domElement }) => {
        if (this.props.domElement !== domElement) {
            this.controls = new Controls(this.refs.camera, domElement);
        }
    }

    /**
     * Starts tweening the camera to the new target if targetId has changed.
     *
     * @param {Object} props
     * @param {String} props.targetId
     */
    maybeMoveCameraPivot = ({ targetId }) => {
        if (this.props.targetId !== targetId) {
            this.movePivot(targetId, !!this.props.targetId);
        }
    }

    /**
     * Sets the min distance to the radius of the target, if the scale or target updated.
     * This prevents the camera from colliding with the target, should the zoom change.
     *
     * @param {Object} props
     * @param {String} props.targetId - id of active target
     * @param {Number} props.scale - user-defined planet scale
     */
    maybePreventCameraCollision = ({ targetId, scale }) => {
        if (this.props.targetId !== targetId || this.props.scale !== scale) {
            this.controls.minDistance = CameraService
                .getMinDistance(this.props.orbitalData, targetId, scale);
        }
    }

    /**
     * Updates zoom level if the zoom prop has changed.
     *
     * @param {Object} props
     * @param {Number} props.zoom - new zoom prop value
     */
    maybeUpdateControlsZoom = ({ zoom }) => {
        if (this.props.zoom !== zoom) {
            this.controls.zoom(zoom);
        }
    }

    /**
     * Updates the auto orbit state if the isAutoOrbitEnabled has changed.
     *
     * @param {Object} props
     * @param {Boolean} props.isAutoOrbitEnabled - new isAutoOrbitEnabled prop value
     */
    maybeUpdateAutoOrbit = ({ isAutoOrbitEnabled }) => {
        if (this.props.isAutoOrbitEnabled !== isAutoOrbitEnabled) {
            this.controls.autoRotate = isAutoOrbitEnabled;
        }
    }

    /**
     * Starts Tween to the position having a key of targetId.
     *
     * @param {String} targetId - name of orbital to move to
     * @param {Boolean} animate - set to true if it should animate
     */
    movePivot = (targetId, animate) => {
        const { scene } = this.props;
        const { pivot } = this.refs;
        const target = scene.getObjectByName(targetId);

        if (target && animate) {
            this.setInteractivity(false);
            this.startTween(target, pivot, scene);
        }
    }

    /**
     * Cancels any Tween in progress.
     */
    cancelTween = () => {
        if (this.tweenBase) {
            this.tweenBase.stop();
            delete this.tweenBase;
        }
    }

    /**
     * Teardown for pivot tweening.
     */
    endTween = () => this.setInteractivity(true)

    /**
     * Starts a new Tween to the active target position.
     * Any Tween already in progress will be cancelled.
     *
     * @param {THREE.Object3D} target - target object
     * @param {THREE.Group} pivot - camera pivot
     */
    startTween = (target, pivot, scene) => {
        const v = CameraService.getWorldPosition(target);
        const w = CameraService.getWorldPosition(pivot);

        // set the pivot position to active position
        CameraService.attachToWorld(scene, pivot, w);

        this.cancelTween();
        this.zoomInFull();

        this.tweenBase = CameraService.getPivotTween(w, v, target, pivot, this.endTween);
    }

    /**
     * Enables/disables scene interactivity.
     *
     * @param {Boolean} disabled - whether or not controls are disabled
     */
    setInteractivity = (enabled) => {
        this.props.action.setUIControls(!!enabled);
        this.props.action.setPlaying(enabled);
        this.controls.enabled = !!enabled;
    }

    /**
     * Tweens zoom to minimum allowable zoom.
     */
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
