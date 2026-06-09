import React from 'react';
import Slider from '../Slider';
import PropTypes from 'prop-types';

export default class ScaleSlider extends React.Component {

    static propTypes = {
        label: PropTypes.string,
        value: PropTypes.number,
        onChange: PropTypes.func,
        min: PropTypes.number,
        max: PropTypes.number
    }

    render() {
        return (
            <div>
                <div className="slider slider--horizontal">
                    <span className="slider__label">
                        {this.props.label}
                        {this.props.value || this.props.min}
                    </span>
                    <Slider
                        orientation="horizontal"
                        value={this.props.value}
                        onChange={this.props.onChange}
                        defaultValue={this.props.min}
                        min={this.props.min}
                        max={this.props.max}
                    />
                </div>
            </div>
        );
    }
}
