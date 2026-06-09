import React from 'react';
import PropTypes from 'prop-types';
import { DoubleSide, Euler } from 'three';
import Scale from '../../../utils/Scale';
import MathService from '../../../services/MathService';
import TextureContainer from '../../../containers/TextureContainer';

export default class Rings extends React.Component {

    static propTypes = {
        outerRadius: PropTypes.number.isRequired,
        maps: PropTypes.array.isRequired,
        barycenterTilt: PropTypes.number.isRequired,
        scale: PropTypes.number
    }

    render() {
        const { outerRadius, scale, maps } = this.props;
        const tilt = MathService.toRadians(this.props.barycenterTilt);
        const size = Scale(outerRadius * 2, scale);
        const rotation = new Euler(tilt, 0, 0);

        return (
            <mesh rotation={rotation}>
                <planeGeometry
                    width={size}
                    height={size}
                />
                <TextureContainer
                    transparent={true}
                    side={DoubleSide}
                    textures={maps}
                />
            </mesh>
        );
    }
}
