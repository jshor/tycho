import React from 'react';
import { connect } from 'react-redux';
import * as UIControlsActions from '../actions/UIControlsActions';
import * as TourActions from '../actions/TourActions';
import * as LabelActions from '../actions/LabelActions';
import ReduxService from '../services/ReduxService';
import TourService from '../services/TourService';
import TourLabelContainer from './TourLabelContainer';
import Tour from '../components/Tour';
import Constants from '../constants';
import { TourLabelItem, PageText } from '../types';

interface Props {
    labels?: TourLabelItem[];
    controlsEnabled?: boolean;
    scale?: number;
    targetId?: string;
    isComplete?: boolean;
    isSkipped?: boolean;
    playing?: boolean;
    pageText?: PageText;
    action?: Record<string, any>;
}

export class TourContainer extends React.Component<Props> {

    componentDidMount = () => {
        if (TourService.canSkip()) {
            this.props.action.tourSkipped(true);
        }
    }

    componentWillReceiveProps = (nextProps: Props) => {
        this.maybeSkipTour(nextProps);
        this.maybeStartTour(nextProps);
    }

    maybeSkipTour = ({ isSkipped }: Props) => {
        if (this.props.isSkipped !== isSkipped && isSkipped) {
            this.skipTour();
        }
    }

    maybeStartTour = ({ playing }: Props) => {
        if (playing && !this.props.playing && !this.props.isComplete) {
            this.initializeTour();
        }
    }

    shouldRunTour = (): boolean => {
        return this.props.playing && !this.props.isSkipped;
    }

    initializeTour = () => {
        const { action, labels } = this.props;
        const tourDuration = TourService.getTourDuration(labels);

        if (!TourService.canSkip()) {
            action.setUIControls(false);
            action.setCameraOrbit(true);

            setTimeout(this.onOrbitComplete, tourDuration);
        }
    }

    onOrbitComplete = () => {
        if (!this.props.isComplete) {
            this.setDefaultActiveOrbital();
            setTimeout(this.onTourComplete, Constants.WebGL.Tween.SLOW);
        }
    }

    onTourComplete = () => {
        this.props.action.tourCompleted(true);
    }

    skipTour = () => {
        const { action } = this.props;

        action.tourCompleted(true);
        action.setCameraOrbit(false);
        action.setUIControls(true);

        this.setDefaultActiveOrbital();
    }

    setDefaultActiveOrbital = () => {
        setTimeout(() => {
            this.props.action.setActiveOrbital(...Constants.UI.Targets.ALTERNATE);
            this.props.action.setActiveOrbital(...Constants.UI.Targets.DEFAULT);
        });
    }

    skipTourTrigger = () => {
        TourService.setSkip();
        this.skipTour();
    }

    getLabels = (labels: TourLabelItem[]) => {
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
)(TourContainer as React.ComponentType<any>) as any;
