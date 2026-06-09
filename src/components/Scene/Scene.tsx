import React from 'react';
import PropTypes from 'prop-types';
import OrbitalContainer from '../../containers/OrbitalContainer';
import Sun from '../Sun';

export default class Scene extends React.Component {

    static propTypes = {
        orbitalData: PropTypes.array.isRequired,
        time: PropTypes.number,
        camera: PropTypes.object,
        scale: PropTypes.number,
        domEvents: PropTypes.object,
        highlightedOrbitals: PropTypes.array,
        targetId: PropTypes.string
    }

    getOrbitalElements = (orbitals, isSatellite) => {
        return orbitals.map((orbital) => (
            <OrbitalContainer
                {...orbital}
                key={orbital.id}
                action={this.props.action}
                scale={this.props.scale}
                time={this.props.time}
                camera={this.props.camera}
                domEvents={this.props.domEvents}
                targetId={this.props.targetId}
                highlightedOrbitals={this.props.highlightedOrbitals}
                isSatellite={isSatellite}>
                {orbital.satellites && this.getOrbitalElements(
                    orbital.satellites, !isSatellite
                )}
            </OrbitalContainer>
        ));
    }

    render() {
        return (
            <group>
                {this.getOrbitalElements(this.props.orbitalData)}
                <Sun camera={this.props.camera} />
            </group>
        );
    }
}
