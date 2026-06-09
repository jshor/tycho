import React from 'react';
import ReactSlider from 'react-slider';
import PropTypes from 'prop-types';

export default class Slider extends React.Component {

    static propTypes = {
        orientation: PropTypes.string.isRequired,
        step: PropTypes.number,
        min: PropTypes.number,
        max: PropTypes.number,
        value: PropTypes.number,
        onChange: PropTypes.func
    }

    componentDidMount = () => {
        this.setState({
            value: this.getInitialValue()
        });
    }

    getInitialValue = () => {
        const { value } = this.props;
        return value || 0;
    }

    getClassName = (subName) => {
        const { orientation } = this.props;
        let baseName = 'slider';

        if (subName) {
            baseName += `__${subName}`;
        }
        return `${baseName} ${baseName}--${orientation}`;
    }

    render() {
        return (
            <ReactSlider
                orientation={this.props.orientation}
                className={this.getClassName('container')}
                handleClassName={this.getClassName('handle')}
                barClassName={this.getClassName('bar')}
                pearling={true}
                step={this.props.step}
                min={this.props.min}
                max={this.props.max}
                value={this.props.value}
                onChange={this.props.onChange}
            />
        );
    }
}
