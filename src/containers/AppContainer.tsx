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

export class AppContainer extends React.Component {

    componentWillMount = () => {
        this.clock = new Clock();
        this.lastTime = 0;

        this.props.action.requestOrbitalData();
        this.props.action.requestPageText();
        this.maybeUpdateTime(true);
    }

    componentWillReceiveProps = (nextProps) => {
        this.maybeUpdateOffset(nextProps);
    }

    /**
     * Animation frame method.
     */
    onAnimate = () => {
        this.maybeUpdateTime();
        this.maybeContinue();
        this.maybeStop();

        this.clock.speed(this.props.speed);
        this.clock.update();
    }

    /**
     * Updates the offset of the clock instance if scene is not paused.
     *
     * @param {Object} nextProps
     * @param {Number} nextProps.timeOffset - offset to update, in UNIX time (ms)
     */
    maybeUpdateOffset = ({ timeOffset }) => {
        if (timeOffset !== this.props.timeOffset && this.props.playing) {
            this.clock.setOffset(timeOffset);
        }
    }

    /**
     * Updates the global time with clock time, if changed.
     */
    maybeUpdateTime = (force) => {
        if (force || this.shouldUpdateTime()) {
            this.lastTime = this.clock.getTime();
            this.props.action.setTime(this.lastTime);
        }
    }

    /**
     * Continues the global clock if the scene is OK to play but the clock is stopped.
     */
    maybeContinue = () => {
        if (this.props.playing && this.clock.stopped) {
            this.clock.continue();
        }
    }

    /**
     * Stops the global clock if the scene is stopped but the clock is running.
     */
    maybeStop = () => {
        if (!this.props.playing && !this.clock.stopped) {
            this.clock.stop();
        }
    }

    /**
     * Determines if a global time update is necessary.
     *
     * @return {Boolean}
     */
    shouldUpdateTime = () => {
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
)(AppContainer);
