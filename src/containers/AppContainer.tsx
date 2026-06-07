import React from 'react';
import { connect } from 'react-redux';
import webglEnabled from 'webgl-detect';
import Clock from '../utils/Clock';
import ReduxService from '../services/ReduxService';
import App from '../components/App';
import NoWebGL from '../components/NoWebGL';
import SplashScreen from '../components/SplashScreen';
import * as DataActions from '../actions/DataActions';
import * as AnimationActions from '../actions/AnimationActions';
import { OrbitalData, PageText } from '../types';

interface Props {
    speed?: number;
    scale?: number;
    timeOffset?: number;
    orbitalData?: OrbitalData[];
    pageText?: PageText;
    targetName?: string;
    playing?: boolean;
    action: Record<string, any>;
}

export class AppContainer extends React.Component<Props> {

    clock: Clock;
    lastTime: number = 0;

    componentWillMount = () => {
        this.clock = new Clock();
        this.lastTime = 0;

        this.props.action.requestOrbitalData();
        this.props.action.requestPageText();
        this.maybeUpdateTime(true);
    }

    componentWillReceiveProps = (nextProps: Props) => {
        this.maybeUpdateOffset(nextProps);
    }

    onAnimate = () => {
        this.maybeUpdateTime();
        this.maybeContinue();
        this.maybeStop();

        this.clock.speed(this.props.speed);
        this.clock.update();
    }

    maybeUpdateOffset = ({ timeOffset }: Props) => {
        if (timeOffset !== this.props.timeOffset && this.props.playing) {
            this.clock.setOffset(timeOffset);
        }
    }

    maybeUpdateTime = (force?: boolean) => {
        if (force || this.shouldUpdateTime()) {
            this.lastTime = this.clock.getTime();
            this.props.action.setTime(this.lastTime);
        }
    }

    maybeContinue = () => {
        if (this.props.playing && this.clock.stopped) {
            this.clock.continue();
        }
    }

    maybeStop = () => {
        if (!this.props.playing && !this.clock.stopped) {
            this.clock.stop();
        }
    }

    shouldUpdateTime = (): boolean => {
        if (this.clock.getTime() !== this.lastTime) {
            return !!this.props.playing;
        }
        return false;
    }

    render() {
        const { orbitalData, pageText } = this.props;

        if (orbitalData && pageText) {
            if (!webglEnabled) {
                return <NoWebGL pageText={this.props.pageText} />;
            }
            return <App
                onAnimate={this.onAnimate}
                title={this.props.targetName}
                pageText={this.props.pageText}
            />;
        }
        return <SplashScreen />;
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'uiControls.speed',
        'uiControls.scale',
        'uiControls.timeOffset',
        'data.orbitalData',
        'data.pageText',
        'label.targetName',
        'animation.playing'
    ),
    ReduxService.mapDispatchToProps(
        DataActions,
        AnimationActions
    )
)(AppContainer as React.ComponentType<any>) as any;
