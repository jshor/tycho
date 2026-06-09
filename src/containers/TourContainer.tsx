import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as UIControlsActions from '../actions/UIControlsActions';
import * as TourActions from '../actions/TourActions';
import * as LabelActions from '../actions/LabelActions';
import ReduxService from '../services/ReduxService';
import TourService from '../services/TourService';
import TourLabelContainer from './TourLabelContainer';
import Tour from '../components/Tour';
import Constants from '../constants';

export class TourContainer extends React.Component {

    static propTypes = {
        labels: PropTypes.array
    }

    componentDidMount = () => {
        if (TourService.canSkip()) {
            this.props.action.tourSkipped(true);
        }
    }

    componentWillReceiveProps = (nextProps) => {
        this.maybeSkipTour(nextProps);
        this.maybeStartTour(nextProps);
    }

    /**
     * Skips tour if opted to do so and is not already skipped.
     *
     * @param {Object} nextProps
     * @param {Boolean} nextProps.isSkipped
     */
    maybeSkipTour = ({ isSkipped }) => {
        if (this.props.isSkipped !== isSkipped && isSkipped) {
            this.skipTour();
        }
    }

    /**
     * Starts tour if not already initialized.
     *
     * @param {Object} nextProps
     * @param {Boolean} nextProps.playing
     */
    maybeStartTour = ({ playing }) => {
        if (playing && !this.props.playing && !this.props.isComplete) {
            this.initializeTour();
        }
    }

    /**
     * Returns true if the tour should be run.
     *
     * @returns {Boolean}
     */
    shouldRunTour = () => {
        return this.props.playing && !this.props.isSkipped;
    }

    /**
     * Initializes the tour.
     */
    initializeTour = () => {
        const { action, labels } = this.props;
        const tourDuration = TourService.getTourDuration(labels);

        if (!TourService.canSkip()) {
            action.setUIControls(false);
            action.setCameraOrbit(true);

            setTimeout(this.onOrbitComplete, tourDuration);
        }
    }

    /**
     * Callback to invoke once the tour orbit has completed.
     */
    onOrbitComplete = () => {
        if (!this.props.isComplete) {
            this.setDefaultActiveOrbital();
            setTimeout(this.onTourComplete, Constants.WebGL.Tween.SLOW);
        }
    }

    /**
     * Callback to invoke once the entire tour is completed.
     */
    onTourComplete = () => {
        this.props.action.tourCompleted(true);
    }

    /**
     * Skips the tour and zooms directly into the target planet.
     */
    skipTour = () => {
        const { action } = this.props;

        action.tourCompleted(true);
        action.setCameraOrbit(false);
        action.setUIControls(true);

        this.setDefaultActiveOrbital();
    }

    /**
     * Sets the active orbital targetId and the header label text to UI defaults.
     */
    setDefaultActiveOrbital = () => {
        setTimeout(() => {
            this.props.action.setActiveOrbital(...Constants.UI.Targets.ALTERNATE);
            this.props.action.setActiveOrbital(...Constants.UI.Targets.DEFAULT);
        });
    }

    /**
     * Sets the skip tour cookie and skips tour.
     */
    skipTourTrigger = () => {
        TourService.setSkip();
        this.skipTour();
    }

    /**
     * Maps the labels list prop to TourLabelContainers.
     *
     * @param {Object[]} labels - list of labels
     * @returns {TourLabelContainer[]}
     */
    getLabels = (labels) => {
        const separation = Constants.Tour.SEPARATION_INTERVAL;
        let totalTime = separation;

        return labels.map(({ text, duration }, key) => {
            totalTime += separation;
            const start = totalTime;
            totalTime += duration;
            const end = totalTime;

            return (
                <TourLabelContainer
                    key={key}
                    text={text}
                    start={start}
                    end={end}
                />
            );
        });
    }

    render() {
        if (!this.shouldRunTour()) {
            return null;
        }
        return (
            <Tour
                {...this.props}
                skipTour={this.skipTourTrigger}
                labels={this.getLabels(this.props.labels)}
            />
        );
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'uiControls.controlsEnabled',
        'uiControls.scale',
        'label.targetId',
        'tour.isComplete',
        'tour.isSkipped',
        'animation.playing',
        'data.pageText'
    ),
    ReduxService.mapDispatchToProps(
        UIControlsActions,
        TourActions,
        LabelActions
    )
)(TourContainer);
