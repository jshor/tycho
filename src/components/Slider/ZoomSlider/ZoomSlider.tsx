import React from 'react';
import Slider from '../Slider';
import PropTypes from 'prop-types';
import Constants from '../../../constants';

export default class ZoomSlider extends React.Component {

    static propTypes = {
        value: PropTypes.number,
        onChange: PropTypes.func
    }

    render() {
        return (
            <div className="slider slider--vertical">
                <Slider
                    orientation="vertical"
                    invert={true}
                    step={Constants.WebGL.Zoom.STEP}
                    min={Constants.WebGL.Zoom.MIN}
                    max={Constants.WebGL.Zoom.MAX}
                    value={this.props.value || Constants.WebGL.Zoom.MAX}
                    onChange={this.props.onChange}
                />
            </div>
        );
    }
}
