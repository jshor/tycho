import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class Volume extends React.Component {

    static propTypes = {
        playing: PropTypes.bool,
        onClick: PropTypes.func
    }

    render() {
        return (
            <div
                onClick={this.props.onClick}
                className={cx({
                    'volume': true,
                    'volume volume--playing': this.props.playing,
                    'volume volume--muted': !this.props.playing
                })}>
                <div className="volume__bar"></div>
                <div className="volume__bar"></div>
                <div className="volume__bar"></div>
                <div className="volume__bar"></div>
            </div>
        );
    }
}
