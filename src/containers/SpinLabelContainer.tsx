import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SpinLabel from '../components/SpinLabel';
import ReduxService from '../services/ReduxService';
import * as TourActions from '../actions/TourActions';
import * as UIControlsActions from '../actions/UIControlsActions';
import Constants from '../constants';

export class SpinLabelContainer extends React.Component {

    static propTypes = {
        isComplete: PropTypes.bool,
        isAutoOrbitEnabled: PropTypes.bool
    }

    componentWillReceiveProps = (nextProps) => {
        this.maybeStopSpinPrompt(nextProps);
    }

    /**
     * Stops auto-rotation of the camera if scene touched while active.
     */
    maybeStopSpinPrompt = ({ touched }) => {
        if (this.props.touched !== touched && this.isVisible()) {
            this.props.action.setCameraOrbit(false);
            this.props.action.setUIControls(true);
        }
    }

    /**
     * Calculate visibility of label based on props.
     *
     * @returns {Boolean} visibility of label
     */
    isVisible = () => {
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
)(SpinLabelContainer);
