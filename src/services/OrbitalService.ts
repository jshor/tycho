import * as THREE from 'three';
import MathService from './MathService';
import PhysicsService from './PhysicsService';
import Constants from '../constants';

export default class OrbitalService {

    /**
     * Ascension of the ecliptic plane.
     *
     * @type {Number}
     */
    static ASCENSION = 90

    /**
     * Calculates the Eulerian rotation set of the ecliptic group.
     *
     * @param {Object} props - OrbitalContainer props
     * @param {Number} props.longitudeOfAscendingNode - longitude of ascending node, in degrees
     * @returns {THREE.Euler} Eulerian rotation set
     */
    static getEclipticGroupRotation = ({ longitudeOfAscendingNode, isSatellite }) => {
        const ascension = isSatellite ? 0 : -OrbitalService.ASCENSION;

        return OrbitalService.toEuler({
            x: ascension,
            z: OrbitalService.ASCENSION + longitudeOfAscendingNode
        });
    }

    /**
     * Calculates the Eulerian rotation set of the orbital group.
     *
     * @param {Object} props - OrbitalContainer props
     * @param {Number} props.inclination - inclination, in degrees
     * @param {Number} props.argumentOfPeriapsis - argument of periapsis, in degrees
     * @returns {THREE.Euler} Eulerian rotation set
     */
    static getOrbitalGroupRotation = ({ inclination, argumentOfPeriapsis }) => {
        return OrbitalService.toEuler({
            x: inclination,
            z: OrbitalService.ASCENSION + argumentOfPeriapsis
        });
    }

    /**
     * Calculates 3D rotation of the spherical orbital body.
     *
     * @param {Object} props - OrbitalContainer props
     * @param {Number} props.axialTilt - axis tilt
     * @param {Number} props.sidereal - apparent sidereal rotation of orbital (in sidereal days)
     * @param {Number} props.time - UNIX timestamp at position (in milliseconds)
     * @returns {THREE.Euler} Eulerian vector
     */
    static getBodyRotation = ({ axialTilt, sidereal, time }) => {
        return OrbitalService.toEuler({
            x: OrbitalService.ASCENSION + axialTilt,
            y: OrbitalService.getRotationCompleted(sidereal, time),
        });
    }

    /**
     * Returns the rotation of the given sidereal in degrees w.r.t. time.
     *
     * @note All rotation periods are w.r.t. to one Earth day (not sidereal days!)
     * @param {Number} sidereal - apparent sidereal rotation of orbital (in sidereal days)
     * @param {Number} time - UNIX timestamp at position (in seconds)
     * @returns {Number} degree of rotation [0,360]
     */
    static getRotationCompleted = (sidereal, time) => {
        const unixTimeToDays = time / 60 / 60 / 24; // seconds to days
        const percentRotated = (unixTimeToDays / sidereal) % 1;
        const degreesRotated = percentRotated * 360;

        return degreesRotated;
    }

    /**
     * Returns the present position vector w.r.t. the elliptical plane.
     *
     * @param {Object} props - OrbitalContainer props
     * @param {Object} props.periapses - Orbital periapses
     * @param {Number} props.time - current time, in seconds
     * @param {Ellipse} ellipse - instance of ellipse
     * @returns {THREE.Vector3} projected body position
     */
    static getBodyPosition = ({ periapses, time }, ellipse) => {
        return ellipse.getPosition(time, periapses);
    }

    /**
     * Calculates path opacity based on whether or not the orbital with
     * the given id is in the set of highlighted orbitals.
     *
     * @param {Object} props - OrbitalContainer props
     * @param {String} props.id - id of orbital
     * @param {String[]} highlightedOrbitals - list of highlighted orbital ids
     * @param {Boolean} force - if true, returns the ON state hover opacity
     * @returns {Number} opacity
     */
    static getPathOpacity = ({ id }, highlightedOrbitals, force) => {
        if (force) {
            return Constants.UI.HOVER_OPACITY_ON;
        } else if (Array.isArray(highlightedOrbitals)) {
            const isHighlighted = highlightedOrbitals
                .filter((orbital) => orbital === id)
                .length;

            if (isHighlighted) {
                return Constants.UI.HOVER_OPACITY_ON;
            }
        }
        return Constants.UI.HOVER_OPACITY_OFF;
    }

    /**
     * Returns the max camera viewing distance, in WebGL units.
     *
     * @param {Object} props
     * @param {Boolean} props.isSatellite
     * @returns {Number}
     */
    static getMaxViewDistance = ({ isSatellite }) => {
        if (isSatellite) {
            return Constants.WebGL.Camera.SATELLITE_LABEL_RANGE;
        }
        return Infinity;
    }

    /**
     * Converts a rotational vector to an Eulerian rotation set.
     *
     * @param {Object} coords - rotations
     * @param {Number} [coords.x = 0] - x rotation, in degrees
     * @param {Number} [coords.y = 0] - y rotation, in degrees
     * @param {Number} [coords.z = 0] - z rotation, in degrees
     * @returns {THREE.Euler} Eulerian rotation set
     */
    static toEuler = ({ x, y, z }) => {
        const rad = (x) => {
            if (x) {
                return MathService.toRadians(x);
            }
            return 0;
        }
        return new THREE.Euler(rad(x), rad(y), rad(z));
    }

    /**
     * Finds the planet with the given targetName.
     *
     * @param {Object[]} orbitals - list of orbitals
     * @param {String} targetName - id of active orbital target
     * @returns {Number} orbital radius
     */
    static getTargetByName = (orbitals, targetName) => {
        let target;

        orbitals.forEach((orbital) => {
            if (!target) {
                if (orbital.id === targetName) {
                    target = orbital;
                } else if (orbital.satellites) {
                    target = OrbitalService
                        .getTargetByName(orbital.satellites, targetName);
                }
            }
        });
        return target;
    }

    /**
     * Returns the given stat to the thousands place and commas.
     *
     * @param {Number} x - number to format
     * @returns {String} formatted number
     */
    static formatStat = (x) => {
        return x
            .toFixed(3)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Retrieve stats of the given orbital.
     *
     * @param {Object[]} orbital - orbital to retrieve stats of
     * @param {Number} time - time to get stats at, in UNIX seconds
     * @returns {Object} {magnitude: Number, velocity: Number, trueAnomaly: Number}
     */
    static getOrbitalStats = (target, time) => {
        const {
            eccentricity,
            periapses,
            centralMass,
            semimajor
        } = target;

        const {
            distance,
            trueAnomaly
        } = PhysicsService.getDistanceFromAttractingBody(eccentricity, time, periapses, semimajor);
        const energy = PhysicsService.orbitalEnergyConservation(centralMass, distance, semimajor);

        const magnitude = OrbitalService.formatStat(distance);
        const velocity = OrbitalService.formatStat(energy);
        const theta = OrbitalService.formatStat(trueAnomaly);

        return { magnitude, velocity, trueAnomaly: theta };
    }
}
