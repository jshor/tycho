import React from 'react';
import PropTypes from 'prop-types';

export default class SpinLabel extends React.Component {

    static propTypes = {
        show: PropTypes.bool,
        count: PropTypes.number
    }

    /**
     * Generates an array of n divs with the provided modifier.
     *
     * @param {String} modifier - BEM class modifier
     * @param {Number} count - number of arrows to provide
     * @return {<div />[]} array of divs with the expected class
     */
    createArrowSet = (modifier, count) => {
        const base = 'spin__arrow';
        const arrows = [];

        for (let i = 0; i < count; i++) {
            arrows.push(
                <span
                    className={`${base} ${base}--${modifier}`}
                    key={i}>
                </span>
            );
        }

        return (
            <div className={`${base}-container--${modifier}`}>
                {arrows}
            </div>
        );
    }

    render() {
        const { count, show } = this.props;
        const modifier = show ? 'show' : 'hide';

        return (
            <div className={`spin-container spin-container--${modifier}`}>
                <div className="spin">
                    {this.createArrowSet('left', count)}
                    <div className="spin__label">Spin</div>
                    {this.createArrowSet('right', count)}
                </div>
            </div>
        );
    }
}

