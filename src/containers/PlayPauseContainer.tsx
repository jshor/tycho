import React from 'react';
import { connect } from 'react-redux';
import ReduxService from '../services/ReduxService';
import * as AnimationActions from '../actions/AnimationActions';
import PlayPause from '../components/PlayPause';

interface Props {
    playing?: boolean;
    action?: Record<string, any>;
}

export class PlayPauseContainer extends React.Component<Props> {

    togglePlayer = () => {
        this.props.action.setPlaying(!this.props.playing);
    }

    render() {
        return <PlayPause
            playing={this.props.playing}
            onClick={this.togglePlayer}
        />;
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'animation.playing'
    ),
    ReduxService.mapDispatchToProps(
        AnimationActions
    )
)(PlayPauseContainer as React.ComponentType<any>) as any;
