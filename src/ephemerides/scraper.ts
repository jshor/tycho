import moment, { DurationInputArg2, Moment } from 'moment'
import { telnet as et, TelnetEntry } from './telnet'
import { Ephemeris } from '../types'

/**
 * NASA telnet interface constants.
 */
export const TELNET_HOST = new URL('telnet://horizons.jpl.nasa.gov:6775')

export const TELNET_TIMEOUT = 50000

export const DATE_FORMAT = 'YYYY-DD-MMM HH:mm'

/**
 * Regex patterns
 */
export const JULIAN_DAY_PATTERN = '([0-9\\.]+)\\s*=\\s*A\\.D\\.[^\\n]+'

export const NUMBER_VAR_PATTERN = '([A-z]{1,2})\\s*=\\s*([0-9\\.E\\-\\+]+)'

export const NUMBER_SET_PATTERN = `(${JULIAN_DAY_PATTERN}\\n(\\s*(${NUMBER_VAR_PATTERN})+\\s*)+)\\n`

/**
 * Numerical constants.
 */
export const ONE_DAY_TO_SECONDS = 31540000

export const JULIAN_DAYS_AT_UNIX_EPOCH = 2440587.5

export const SECONDS_IN_YEAR = 86400.0

export const AU_TO_KM = 1.496e8

/**
 * Returns a record of a string whose key is the left of `=` and value is the right of it.
 */
export function getNumberVar(str: string) {
  const entry = str.split('=')
  const key = entry[0].trim()
  const value = entry[1].trim()

  return {
    [key]: parseFloat(value)
  }
}

/**
 * Converts Julian days to UNIX timestamp.
 */
export function julianToUnix(julian: number): number {
  return (julian - JULIAN_DAYS_AT_UNIX_EPOCH) * SECONDS_IN_YEAR * 1000
}

/**
 * Returns object of periapsis data from the given list of data sets.
 */
export function getPeriapses([record]: Record<string, number>[]): { last: number; next: number } {
  return {
    last: julianToUnix(record.Tp),
    next: julianToUnix(record.Tp + record.PR)
  }
}

/**
 * Extracts numerical results from string sets and maps them to an object.
 */
export function mapToDataSets(sets: string[]): Record<string, number>[] {
  return sets.map((set) => {
    const vars = set.match(new RegExp(NUMBER_VAR_PATTERN, 'g'))
    const data = {}

    vars.forEach((v) => {
      Object.assign(data, getNumberVar(v))
    })

    return data
  })
}

/**
 * Calculates semiminor axis from eccentricity and semimajor.
 */
export function getSemiminorAxis(eccentricity: number, semimajor: number) {
  return semimajor * Math.sqrt(1 - Math.pow(eccentricity, 2))
}

/**
 * Returns data in Tycho format.
 *
 * See Github wiki page on Tycho data format.
 */
export function getTychoData(sets: string[], isHeliocentric: boolean) {
  const dataSets = mapToDataSets(sets)
  const dataSet = dataSets[0]
  const periapses = getPeriapses(dataSets)
  const semiminor = getSemiminorAxis(dataSet.EC, dataSet.A)
  const scalar = isHeliocentric ? AU_TO_KM : 1

  return {
    argumentOfPeriapsis: dataSet.W,
    eccentricity: dataSet.EC,
    longitudeOfAscendingNode: dataSet.OM,
    semimajor: dataSet.A * scalar,
    semiminor: semiminor * scalar,
    periapses
  }
}

/**
 * Returns a data set from the raw response from NASA ephemerides.
 */
export function getDataFromRaw(data: string, ephemeris: Ephemeris) {
  const sets = data.match(new RegExp(NUMBER_SET_PATTERN, 'g'))
  const isHeliocentric = ephemeris.nasaBarycenterCode === '10'

  if (Array.isArray(sets)) {
    return getTychoData(sets, isHeliocentric)
  }
}

/**
 * Returns the next revolution order in the sequence, or undefined if N/A.
 */
export function nextOrder(revolutionOrder: string): string | undefined {
  const orders = ['y', 'mo', 'd', 'h', 'm']

  for (let i = 0; i < orders.length - 1; i++) {
    if (revolutionOrder === orders[i]) {
      return orders[i + 1]
    }
  }
}

/**
 * Converts the NASA revolution order code to moment.js order code.
 */
export function momentDateOrder(revolutionOrder: string): DurationInputArg2 {
  if (revolutionOrder === 'mo') {
    return 'month'
  }
  return revolutionOrder as DurationInputArg2
}

/**
 * Renders an array of start, end dates and revolution order.
 */
export function renderDates(revolutionOrder: string, date: Moment): [string, string] {
  const start = date.clone().format(DATE_FORMAT)

  const end = date
    .clone()
    .add(500, momentDateOrder(revolutionOrder)) // TODO: why 500?
    .format(DATE_FORMAT)

  return [start, end]
}

/**
 * Returns whether the given revolution order warrants another lookup.
 *
 * @param  {String} revolutionOrder - NASA revolution order code
 * @return {Boolean}
 */
export function shouldLookupAgain(revolutionOrder: string): boolean {
  return revolutionOrder !== 'm'
}

/**
 * Renders the request for expect-telnet.
 */
export function getRequest(ephemeris: Ephemeris, date: Moment): TelnetEntry[] {
  const [startDate, endDate] = renderDates(ephemeris.revolutionOrder, date)

  return [
    /** Initial greeting from the telnet interactive. */
    {
      output: /Horizons> /g,
      input: `${ephemeris.nasaOrbitalCode}\r\n`
    },

    /** The telnet interactive sequence is as follows: */
    ...[
      // prompt: "Select ... [E]phemeris, [F]tp, [M]ail, [R]edisplay, ?, <cr>"
      'E',
      // prompt: "Observe, Elements, Vectors  [o,e,v,?]"
      'e',
      // prompt: "Coordinate system center   [ ###, ? ]"
      ephemeris.nasaBarycenterCode,
      // prompt: "Reference plane [eclip, frame, body ]"
      'eclip',
      // prompt: "Starting TDB [>= 9999BC-Mar-21 00:01]"
      startDate,
      // prompt: "Ending   TDB [<=   9999-Dec-30 12:00]"
      endDate,
      // prompt: "Output interval [ex: 10m, 1h, 1d, ? ]"
      `1${ephemeris.revolutionOrder}`,
      // prompt: "Accept default output [ cr=(y), n, ?] : "
      'y'
    ].map((s) => ({
      output: /.*/g,
      input: `${s}\r\n`
    })),

    /** Terminal sequence. */
    {
      output: /Computations by/g,
      input: '\r\n'
    }
  ]
}

/**
 * Renders the request for expect-telnet.
 */
export function makeRequest(ephemeris: Ephemeris, date: Moment) {
  const request = getRequest(ephemeris, date)

  return et(TELNET_HOST, request)
}

/**
 * Creates telnet requests for the given date. Will recursively loop through
 * each subsequent revolution periods down to one minute.
 */
export async function requestZoomIn(ephemeris: Ephemeris, date: Moment) {
  const data = await makeRequest(ephemeris, date)
  const { periapses } = getDataFromRaw(data, ephemeris)

  if (shouldLookupAgain(ephemeris.revolutionOrder)) {
    const revolutionOrder = nextOrder(ephemeris.revolutionOrder)

    return requestZoomIn({ ...ephemeris, revolutionOrder }, moment(periapses.last))
  }

  return periapses.last
}

/**
 * Creates the initial telnet request to retrieve ephemeris data.
 */
export async function getEphemeris(ephemeris: Ephemeris) {
  const data = await makeRequest(ephemeris, moment())
  const revolutionOrder = nextOrder(ephemeris.revolutionOrder)
  const formattedData = getDataFromRaw(data, ephemeris)
  const last = moment(formattedData.periapses.last)
  const next = moment(formattedData.periapses.next)
  const periapsesEpochs = await Promise.all([
    requestZoomIn({ ...ephemeris, revolutionOrder }, last),
    requestZoomIn({ ...ephemeris, revolutionOrder }, next)
  ])

  return {
    ...formattedData,
    periapses: {
      last: periapsesEpochs[0],
      next: periapsesEpochs[1]
    }
  }
}
