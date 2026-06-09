import React from 'react';
import PropTypes from 'prop-types';

export default class TourLabel extends React.Component {

    static propTypes = {
        modifier: PropTypes.string,
        text: PropTypes.string
    }

    render() {
        return (
            <div className="tour-label">
                <span className={`
                    tour-label__text
                    tour-label__text--${this.props.modifier}`
                }>
                    {this.props.text}
                </span>
            </div>
        );
    }
}

