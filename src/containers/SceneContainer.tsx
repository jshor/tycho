import TWEEN from 'tween.js';
import { CubeTextureLoader } from 'three';
import React from 'react';
import { connect } from 'react-redux';
import React3 from 'react-three-renderer';
import Scene from '../components/Scene';
import Constants from '../constants';
import * as AnimationActions from '../actions/AnimationActions';
import * as UIControlsActions from '../actions/UIControlsActions';
import * as LabelActions from '../actions/LabelActions';
import ReduxService from '../services/ReduxService';
import CameraContainer, { CameraAction } from './CameraContainer';
import EventContainer from './EventContainer';
import { OrbitalData } from '../types';

interface Props {
    orbitalData: OrbitalData[];
    onAnimate: () => void;
    width: number;
    height: number;
    time?: number;
    scale?: number;
    speed?: number;
    volume?: number;
    zoom?: number;
    targetId?: string;
    highlightedOrbitals?: string[];
    isAutoOrbitEnabled?: boolean;
    children?: React.ReactNode;
    action?: CameraAction;
}

export class SceneContainer extends React.Component<Props> {

    domElement: HTMLElement;

    componentDidMount = () => {
        this.forceUpdate();
        this.renderSkybox();
    }

    onAnimate = () => {
        this.props.onAnimate();
        (this.refs as any).camera.update();
        (TWEEN as any).update();
    }

    changeZoom = (ev: WheelEvent) => {
        (this.refs as any).camera.controls.wheelZoom(ev, this.props.action.changeZoom);
    }

    setDomElement = (domElement: HTMLElement) => {
        this.domElement = domElement;
    }

    renderScene = ({ camera }: any) => {
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

    renderSkybox = () => {
        const skybox = new CubeTextureLoader();
        (this.refs as any).scene.background = skybox.load(Constants.WebGL.SKYBOX_TEXTURES);
    }

    render() {
        const { width, height } = this.props;
        const { camera } = this.refs as any;

        return (
            <EventContainer onWheel={this.changeZoom as any}>
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
                            scene={(this.refs as any).scene}
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
)(SceneContainer as React.ComponentType<any>) as any;
