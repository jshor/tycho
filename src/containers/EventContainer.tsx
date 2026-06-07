import React from 'react';
import { connect } from 'react-redux';
import * as EventActions from '../actions/EventActions';
import ReduxService from '../services/ReduxService';

interface Props {
    action?: Record<string, any>;
    touched?: number;
    released?: number;
    onWheel?: React.WheelEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}

export class EventContainer extends React.Component<Props> {

    onTouched = () => {
        this.props.action.setTouched(Date.now());
    }

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
)(EventContainer as React.ComponentType<any>) as any;
