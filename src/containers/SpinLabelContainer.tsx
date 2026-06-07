import React from 'react';
import { connect } from 'react-redux';
import SpinLabel from '../components/SpinLabel';
import ReduxService from '../services/ReduxService';
import * as TourActions from '../actions/TourActions';
import * as UIControlsActions from '../actions/UIControlsActions';
import Constants from '../constants';

interface Props {
    isComplete?: boolean;
    isAutoOrbitEnabled?: boolean;
    touched?: number;
    released?: number;
    action?: Record<string, any>;
}

export class SpinLabelContainer extends React.Component<Props> {

    componentWillReceiveProps = (nextProps: Props) => {
        this.maybeStopSpinPrompt(nextProps);
    }

    maybeStopSpinPrompt = ({ touched }: Props) => {
        if (this.props.touched !== touched && this.isVisible()) {
            this.props.action.setCameraOrbit(false);
            this.props.action.setUIControls(true);
        }
    }

    isVisible = (): boolean => {
        const { isComplete, isAutoOrbitEnabled } = this.props;
        return isComplete && isAutoOrbitEnabled;
    }

    render() {
        return (
            <SpinLabel
                show={this.isVisible()}
                count={Constants.UI.SPIN_LABEL_ARROW_COUNT}
            />
        );
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'tour.isComplete',
        'tour.isAutoOrbitEnabled',
        'event.touched',
        'event.released'
    ),
    ReduxService.mapDispatchToProps(
        TourActions,
        UIControlsActions
    )
)(SpinLabelContainer as React.ComponentType<any>) as any;
