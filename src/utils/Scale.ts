import Constants from '../constants';

/**
 * Scales a number by the WEBGL_SCALE constant.
 *
 * @param {Number} radius - radius to scale
 * @param {Number} scale = 1 - scaling factor
 * @returns {Number} 
 */
export default (radius, scale = 1) => {
    return (scale * radius) / Constants.WebGL.UNIT_SCALE;
}
