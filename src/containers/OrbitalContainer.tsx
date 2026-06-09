import React from 'react';
import PropTypes from 'prop-types';
import Ellipse from '../utils/Ellipse';
import Service from '../services/OrbitalService';
import Orbital from '../components/Orbital';

export class OrbitalContainer extends React.Component {

    static propTypes = {
        inclination: PropTypes.number.isRequired,
        longitudeOfAscendingNode: PropTypes.number.isRequired,
        argumentOfPeriapsis: PropTypes.number.isRequired,
        radius: PropTypes.number.isRequired,
        axialTilt: PropTypes.number.isRequired,
        atmosphere: PropTypes.number,
        sidereal: PropTypes.number,
        id: PropTypes.string.isRequired,
        targetId: PropTypes.string,
        time: PropTypes.number,
        isSatellite: PropTypes.bool,
        active: PropTypes.bool,
        highlightedOrbitals: PropTypes.array,
        maps: PropTypes.array,
        rings: PropTypes.object
    }

    componentWillMount = () => {
        this.ellipse = new Ellipse(this.props);
        this.setGroupRotations(this.props);
        this.setPathOpacity(this.props);
        this.setBodyState(this.props, this.ellipse);
        this.setState({});
    }

    componentWillReceiveProps = (nextProps) => {
        this.maybeUpdateBodyState(nextProps);
        this.maybeUpdatePathOpacity(nextProps);
        this.maybeUpdateScale(nextProps);
    }

    /**
     * Updates the body state properties if time has changed.
     *
     * @param {Object} nextProps
     * @param {Number} nextProps.time - current time, in seconds
     */
    maybeUpdateBodyState = ({ time }) => {
        if (this.props.time !== time) {
            this.setBodyState(this.props, this.ellipse);
        }
    }

    /**
     * Updates the path opacity if the list of highlighted orbitals changed.
     *
     * @param {Object} nextProps
     * @param {String[]} nextProps.highlightedOrbitals
     */
    maybeUpdatePathOpacity = ({ highlightedOrbitals }) => {
        if (this.props.highlightedOrbitals !== highlightedOrbitals) {
            this.setPathOpacity(this.props, highlightedOrbitals);
        }
    }

    /**
     * Updates items that are privy to scale changes when appropriate.
     *
     * @param {Object} nextProps
     * @param {Number} nextProps.time - current time, in seconds
     * @param {Number} nextProps.scale - user-defined scale
     */
    maybeUpdateScale = ({ time, scale }) => {
        if (scale !== this.props.scale) {
            if (this.props.isSatellite) {
                // only update the orbital path scale for satellites
                this.ellipse.setScale(scale);
            }
            this.setBodyState(this.props, this.ellipse);
            // keep track of last time the scale updated so lines
            // don't constantly re-render (which is computationally expensive)
            this.setState({
                scaleLastUpdate: time
            });
        }
    }

    /**
     * Sets the visual opacity of the orbital path ellipse.
     *
     * @param {Object} props - orbital props
     * @param {String[]} highlightedOrbitals
     */
    setPathOpacity = (props, highlightedOrbitals) => {
        this.setState({
            pathOpacity: Service.getPathOpacity(props, highlightedOrbitals, this.isTarget())
        });
    }

    /**
     * Sets the Euler rotations of the orbital and ecliptic planes.
     *
     * @param {Object} props - orbital props
     */
    setGroupRotations = (props) => {
        this.setState({
            eclipticGroupRotation: Service.getEclipticGroupRotation(props),
            orbitalGroupRotation: Service.getOrbitalGroupRotation(props)
        });
    }

    /**
     * Sets the (x,y,z)-coords, radius, and Euler rotation of the body.
     *
     * @param {Object} props - orbital props
     * @param {Ellipse} ellipse - instance of orbital ellipse
     */
    setBodyState = (props, ellipse) => {
        this.setState({
            bodyRotation: Service.getBodyRotation(props),
            bodyPosition: Service.getBodyPosition(props, ellipse),
            maxDistance: Service.getMaxViewDistance(props)
        });
    }

    /**
     * Returns true if this orbital is the current target.
     *
     * @returns {Boolean}
     */
    isTarget = () => {
        return this.props.id === this.props.targetId;
    }

    render() {
        return (
            <Orbital
                eclipticGroupRotation={this.state.eclipticGroupRotation}
                orbitalGroupRotation={this.state.orbitalGroupRotation}
                pathVertices={this.ellipse.getVertices()}
                bodyPosition={this.state.bodyPosition}
                bodyRotation={this.state.bodyRotation}
                pathOpacity={this.state.pathOpacity}
                atmosphere={this.props.atmosphere}
                scaleLastUpdate={this.state.scaleLastUpdate}
                maxDistance={this.state.maxDistance}
                camera={this.props.camera}
                maps={this.props.maps}
                rings={this.props.rings}
                text={this.props.name}
                radius={this.props.radius}
                action={this.props.action}
                children={this.props.children}
                targetId={this.props.targetId}
                scale={this.props.scale}
                id={this.props.id}
            />
        );
    }
}

export default OrbitalContainer;
