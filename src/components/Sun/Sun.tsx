import React from 'react';
import Constants from '../../constants';
import LensFlare from '../../utils/LensFlare';

interface Props {
    camera?: any;
}

export default class Sun extends React.Component<Props> {

    componentDidMount = () => {
        (this.refs as any).sun.add(new LensFlare(this.props.camera));
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
