import Constants from '../constants';

const Scale = (radius: number, scale: number = 1): number => {
    return (scale * radius) / Constants.WebGL.UNIT_SCALE;
};

/**
 * Returns the radius (in km) threshold for a celestial body to be visible in the scene.
 */
export const getVisibleRadius = (radius: number): number => {
    return Math.max(radius, Constants.WebGL.MINIMUM_RADIUS);
};

export default Scale;
