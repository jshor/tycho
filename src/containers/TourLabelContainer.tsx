import React from 'react';
import PropTypes from 'prop-types';
import TourLabel from '../components/TourLabel';

export default class TourLabelContainer extends React.Component {

    static propTypes = {
        text: PropTypes.string,
        start: PropTypes.number,
        end: PropTypes.number
    }

    componentWillMount = () => {
        const { start, end } = this.props;

        this.setState({ modifier: 'hide' });
        this.setClassAsync('show', start);
        this.setClassAsync('hide', end);
    }

    componentWillUnmount = () => {
        this.isCancelled = true;
    }

    /**
     * Updates the local state class name with the given modifier at the given delay.
     *
     * @param {String} modifier - BEM CSS class modifier
     * @param {Number} timeout - delay, in milliseconds
     */
    setClassAsync = (modifier, timeout) => {
        setTimeout(() => {
            if (!this.isCancelled) {
                this.setState({ modifier });
            }
        }, timeout);
    }

    render() {
        return (
            <TourLabel
                modifier={this.state.modifier}
                text={this.props.text}
            />
        );
    }
}
