import React from 'react';
import PropTypes from 'prop-types';
import OrbitalContainer from '../containers/OrbitalContainer';

export default class Scene extends React.Component {

  static propTypes = {
    orbitalData: PropTypes.array.isRequired,
    updatePosition: PropTypes.func.isRequired,
    time: PropTypes.number,
    camera: PropTypes.object,
    scale: PropTypes.number
  }

  getOrbitalElements = (orbitals, isSatellite) => {
    return orbitals.map((orbital) => (
      <OrbitalContainer
        {...orbital}
        scale={this.props.scale}
        time={this.props.time}
        camera={this.props.camera}
        updatePosition={this.props.updatePosition}
        isSatellite={isSatellite}
        key={orbital.id}>
        {orbital.satellites && this.getOrbitalElements(orbital.satellites, !isSatellite)}
      </OrbitalContainer>
    ));
  }

  render() {
    return (
      <group>
        {this.getOrbitalElements(this.props.orbitalData)}
        <axisHelper size={500} />
        <mesh lookAt={this.props.cameraMatrix}>
          <planeGeometry width={100} height={100} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
      </group>
    );
  }
}
