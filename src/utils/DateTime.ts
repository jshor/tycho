import { Constants } from '../constants'

/** Built the once: assembling a formatter is the costly part, and the clock reads every tick. */
const formatter = new Intl.DateTimeFormat(Constants.UI.UX_DATE_LOCALE, Constants.UI.UX_DATE_FORMAT)

/** Milliseconds to the second the simulation counts in. */
const MILLISECONDS = 1000

/**
 * Returns the given time as whole seconds since the epoch, or the current time given none.
 */
export const getUnixTime = (time: Date | number = Date.now()): number => {
  return Math.floor((time instanceof Date ? time.getTime() : time) / MILLISECONDS)
}

/**
 * Returns the current time formatted as `DD MMM YYYY HH:mm:ss`.
 */
export const formatDateTime = (time: Date | number): string => {
  const date = time instanceof Date ? time : new Date(time)

  // a clock with no time to show reads out as nothing, rather than throwing on its way to the screen
  if (isNaN(date.getTime())) {
    return ''
  }

  const { day, month, year, hour, minute, second } = formatter
    .formatToParts(date)
    .reduce<Record<string, string>>((parts, { type, value }) => {
      parts[type] = value

      return parts
    }, {})

  return `${day} ${month} ${year} ${hour}:${minute}:${second}`
}

/**
 * Returns the given time (in seconds) written out for the clock.
 */
export const formatUnixTime = (time: number): string => {
  return formatDateTime(time * MILLISECONDS)
}
