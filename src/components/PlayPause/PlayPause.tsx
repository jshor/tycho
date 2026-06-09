import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class PlayPause extends React.Component {

    static propTypes = {
        onClick: PropTypes.func.isRequired,
        playing: PropTypes.bool
    }

    render() {
        return (
            <div className="play-pause" onClick={this.props.onClick}>
                <span className={cx({
                    'play-pause__button': true,
                    'play-pause__button--playing': this.props.playing,
                    'play-pause__button--paused': !this.props.playing
                })} />
            </div>
        );
    }
}