import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../../../constants';
import Scale from '../../../utils/Scale';
import TextureContainer from '../../../containers/TextureContainer';
import Rings from '../../Orbital/Rings';

export default class Body extends React.Component {

    static propTypes = {
        radius: PropTypes.number.isRequired,
        rings: PropTypes.object,
        rotation: PropTypes.object,
    };

    render() {
        const { rings, radius, scale } = this.props;

        return (
            <group>
                <mesh rotation={this.props.rotation}>
                    <TextureContainer textures={this.props.maps} />
                    <sphereGeometry
                        widthSegments={Constants.WebGL.SPHERE_SEGMENTS}
                        heightSegments={Constants.WebGL.SPHERE_SEGMENTS}
                        radius={Scale(radius, scale)}
                    />
                </mesh>
                {rings && <Rings {...rings} scale={scale} />}
            </group>
        );
    }
}
