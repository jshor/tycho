import Cookies from 'js-cookie';
import Constants from '../constants';

export default class TourService {

    /**
     * Determines if the user has opted, via cookie, to skip the tour.
     *
     * @returns {Boolean} ability to skip tour
     */
    static canSkip = () => {
        return Cookies.get('tourViewed') === 'true';
    }

    /**
     * Sets a cookie to indicate that the tour was either viewed or skipped.
     */
    static setSkip = () => {
        Cookies.set('tourViewed', 'true', { expires: 365 });
    }

    /**
     * Calculates the total time that showing labels will take,
     * separated and padded by the SEPARATION_INTERVAL constant.
     *
     * @param {Object[]} labels - list of labels to sum
     * @returns {Number} total duration
     */
    static getTourDuration = (labels) => {
        const interval = Constants.Tour.SEPARATION_INTERVAL;
        let duration = interval;

        duration += labels.reduce((cur, next) => {
            return cur + next.duration + interval;
        }, 0);
        duration += interval;

        return duration;
    }
}
