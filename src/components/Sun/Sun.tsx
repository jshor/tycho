import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../../constants';
import LensFlare from '../../utils/LensFlare';

export default class Sun extends React.Component {

    static propTypes = {
        camera: PropTypes.object
    }

    componentDidMount = () => {
        this.refs.sun.add(new LensFlare(this.props.camera));
    }

    render() {
        return (
            <group ref="sun">
                <pointLight
                    color={Constants.WebGL.Sunlight.COLOR}
                    intensity={Constants.WebGL.Sunlight.INTENSITY}
                    distance={Constants.WebGL.Sunlight.DISTANCE}
                />
            </group>
        );
    }
}
