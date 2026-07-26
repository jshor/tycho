import Cookies from 'js-cookie'
import Constants from '../constants'
import { TourLabelItem } from '../types'

export default class TourService {
  static canSkip = (): boolean => {
    return Cookies.get('tourViewed') === 'true'
  }

  static setSkip = (): void => {
    Cookies.set('tourViewed', 'true', { expires: 365 })
  }

  static getTourDuration = (labels: TourLabelItem[]): number => {
    const interval = Constants.Tour.SEPARATION_INTERVAL
    let duration = interval

    duration += labels.reduce((cur, next) => {
      return cur + next.duration + interval
    }, 0)
    duration += interval

    return duration
  }
}
