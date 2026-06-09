import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as EventActions from '../actions/EventActions';
import ReduxService from '../services/ReduxService';

export class EventContainer extends React.Component {

    static propTypes = {
        action: PropTypes.object,
        touched: PropTypes.number,
        released: PropTypes.number,
        onWheel: PropTypes.func
    }

    /**
     * Emits the timestamp of when container was last touched.
     */
    onTouched = () => {
        this.props.action.setTouched(Date.now());
    }

    /**
     * Emits the timestamp of when container was last released from touch.
     */
    onReleased = () => {
        this.props.action.setReleased(Date.now());
    }

    render() {
        return (
            <div
                onWheel={this.props.onWheel}
                onTouchStart={this.onTouched}
                onMouseDown={this.onTouched}>
                {this.props.children}
            </div>
        );
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'event.touched',
        'event.released'
    ),
    ReduxService.mapDispatchToProps(
        EventActions
    )
)(EventContainer);
