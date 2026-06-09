import TWEEN from 'tween.js';
import { CubeTextureLoader } from 'three';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React3 from 'react-three-renderer';
import Scene from '../components/Scene';
import Constants from '../constants';
import * as AnimationActions from '../actions/AnimationActions';
import * as UIControlsActions from '../actions/UIControlsActions';
import * as LabelActions from '../actions/LabelActions';
import ReduxService from '../services/ReduxService';
import CameraContainer from './CameraContainer';
import EventContainer from './EventContainer';

export class SceneContainer extends React.Component {

    static propTypes = {
        orbitalData: PropTypes.array.isRequired,
        onAnimate: PropTypes.func.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        time: PropTypes.number
    }

    componentDidMount = () => {
        this.forceUpdate();
        this.renderSkybox();
    }

    /**
     * Animation frame update method.
     */
    onAnimate = () => {
        this.props.onAnimate();
        this.refs.camera.update();
        TWEEN.update();
    }

    /**
     * Maps the mousewheel event to the controls zoom function.
     */
    changeZoom = (ev) => {
        this.refs.camera.controls.wheelZoom(ev, this.props.action.changeZoom);
    }

    /**
     * Sets the renderer DOM element.
     */
    setDomElement = (domElement) => {
        this.domElement = domElement;
    }

    /**
     * Renders a new Scene.
     *
     * @param {Object} refs
     * @param {Camera} refs.camera - THREE.Camera component instance
     * @returns {Scene} instance of scene component
     */
    renderScene = ({ camera }) => {
        return (
            <Scene
                time={this.props.time}
                orbitalData={this.props.orbitalData}
                scale={this.props.scale}
                action={this.props.action}
                targetId={this.props.targetId}
                children={this.props.children}
                highlightedOrbitals={this.props.highlightedOrbitals}
                cameraMatrix={camera.position.clone()}
                camera={camera}
            />
        );
    }

    /**
     * Attaches the skybox to the scene. The skybox uses a cube texture.
     */
    renderSkybox = () => {
        const skybox = new CubeTextureLoader();
        this.refs.scene.background = skybox.load(Constants.WebGL.SKYBOX_TEXTURES);
    }

    render() {
        const { width, height } = this.props;
        const { camera } = this.refs;

        return (
            <EventContainer onWheel={this.changeZoom}>
                <React3
                    onAnimate={this.onAnimate}
                    mainCamera="camera"
                    width={width}
                    height={height}
                    antialias={true}
                    alpha={true}
                    canvasRef={this.setDomElement}>
                    <scene ref="scene">
                        <CameraContainer
                            ratio={width / height}
                            targetId={this.props.targetId}
                            action={this.props.action}
                            speed={this.props.speed}
                            scale={this.props.scale}
                            scene={this.refs.scene}
                            zoom={this.props.zoom}
                            volume={this.props.volume}
                            isAutoOrbitEnabled={this.props.isAutoOrbitEnabled}
                            orbitalData={this.props.orbitalData}
                            domElement={this.domElement}
                            ref="camera"
                        />
                        {camera && this.renderScene(camera.refs)}
                    </scene>
                </React3>
            </EventContainer>
        );
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'uiControls.zoom',
        'uiControls.scale',
        'uiControls.speed',
        'uiControls.volume',
        'label.targetId',
        'label.highlightedOrbitals',
        'tour.isAutoOrbitEnabled',
        'animation.time',
        'data.orbitalData'
    ),
    ReduxService.mapDispatchToProps(
        UIControlsActions,
        AnimationActions,
        LabelActions
    )
)(SceneContainer);
