export default class MathService {

    /**
     * Calculates the circumference of an ellipse.
     * This uses Ramanujan's elliptical approximation formula.
     *
     * @param {Number} a - semimajor axis
     * @param {Nubmer} b - semiminor axis
     * @returns {Number} circumference of ellipse
     */
    static ramanujan(a, b) {
        const p = 3 * b + a;
        const q = 3 * a + b;
        const r = 3 * (a + b);

        return Math.PI * (Math.sqrt(p * q) - r);
    }

    /**
     * Returns one of two focii of an ellipse.
     *
     * @param {Number} x - semimajor axis
     * @param {Number} y - semiminor axis
     * @returns {Number} focus of ellipse
     */
    static getFocus(x, y) {
        return Math.sqrt(Math.pow(x, 2) - Math.pow(y, 2));
    }

    /**
     * Converts the given degrees to radians.
     *
     * @param {Number} deg - number to convert, in degrees
     * @returns {Number} result in radians
     */
    static toRadians(deg) {
        return deg * Math.PI / 180;
    }

    /**
     * Converts the given radians to degrees.
     *
     * @param {Number} rad - number to convert, in radians
     * @returns {Number} result in degrees
     */
    static toDegrees(rad) {
        return (rad * 180) / Math.PI;
    }

    /**
     * Converts arcseconds to radians for the given time.
     *
     * @param {Number} time - UNIX timestamp
     * @param {Number} rotation - rotation, in arcseconds
     * @returns {Number} result in radians
     */
    static arcSecToRad(time, rotation) {
        return this.toRadians(this.arcSecToDeg(time, rotation));
    }

    /**
     * Converts arcseconds to degrees for the given time.
     *
     * @param {Number} time - UNIX timestamp
     * @param {Number} rotation - rotation, in arcseconds
     * @returns {Number} result in degrees
     */
    static arcSecToDeg(time, rotation) {
        return time * (rotation / 3600) % 360;
    }
}
