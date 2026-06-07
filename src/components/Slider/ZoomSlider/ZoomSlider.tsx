import React from 'react';
import Slider from '../Slider';
import Constants from '../../../constants';

interface Props {
    value?: number;
    onChange?: (value: number) => void;
}

export default class ZoomSlider extends React.Component<Props> {

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
