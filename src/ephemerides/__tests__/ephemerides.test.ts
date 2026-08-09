import moment from 'moment'
import { telnet } from '../telnet'
import {
  AU_TO_KM,
  DATE_FORMAT,
  TELNET_HOST,
  getDataFromRaw,
  getEphemeris,
  getNumberVar,
  getPeriapses,
  getRequest,
  getSemiminorAxis,
  getTychoData,
  julianToUnix,
  makeRequest,
  mapToDataSets,
  momentDateOrder,
  nextOrder,
  renderDates,
  requestZoomIn,
  shouldLookupAgain
} from '../scraper'
import { EPHEMERIS_PARAMS, RAW_RESPONSE, RECORDS, SETS } from './__fixtures__/ephemeris'

vi.mock('../telnet', () => ({
  telnet: vi.fn()
}))

const telnetMock = vi.mocked(telnet)

const EPHEMERIS = {
  nasaOrbitalCode: '6',
  nasaBarycenterCode: '10',
  revolutionOrder: 'y'
}

describe('Scraper', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getNumberVar()', () => {
    it('should return the separated string as a trimmed key/value pair', () => {
      const key = 'key'
      const value = 1234
      const result = getNumberVar(`${key} = ${value}`)

      expect(result).toBeTypeOf('object')
      expect(result).toHaveProperty(key)
      expect(result.key).toBe(value)
    })

    it('should parse exponential notation', () => {
      expect(getNumberVar('EC= 4.838072211191377E-02')).toEqual({
        EC: 0.04838072211191377
      })
    })
  })

  describe('julianToUnix()', () => {
    it('should return a UNIX timestamp for the given Julian calendar day', () => {
      const unix = julianToUnix(1234567890)

      expect(typeof unix).toBe('number')
      expect(unix).toBe(1.06455798936e17)
    })

    it('should return 0 at the UNIX epoch', () => {
      expect(julianToUnix(2440587.5)).toBe(0)
    })
  })

  describe('mapToDataSets()', () => {
    let result: Record<string, number>[]

    beforeEach(() => {
      result = mapToDataSets(SETS)
    })

    it('should be an array with length of the input sets', () => {
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(SETS.length)
    })

    it('should return each object with the NASA-designated orbital params', () => {
      result.forEach((res) => {
        expect(res).toBeTypeOf('object')

        EPHEMERIS_PARAMS.forEach((param) => {
          expect(res).toHaveProperty(param)
          expect(typeof res[param]).toBe('number')
        })
      })
    })

    it('should not pick up the Julian day header as a variable', () => {
      expect(Object.keys(result[0])).toEqual([...EPHEMERIS_PARAMS])
    })

    it('should parse the values from the raw record text', () => {
      expect(result).toEqual(RECORDS)
    })
  })

  describe('getPeriapses()', () => {
    let result: { last: number; next: number }

    beforeEach(() => {
      result = getPeriapses(RECORDS)
    })

    it('should return an object with the last and next params', () => {
      expect(result).toBeTypeOf('object')
      expect(result).toHaveProperty('last')
      expect(result).toHaveProperty('next')
    })

    it('should derive `last` from the periapsis epoch of the first record', () => {
      expect(result.last).toBe(julianToUnix(RECORDS[0].Tp))
    })

    it('should derive `next` by advancing one orbital period', () => {
      expect(result.next).toBe(julianToUnix(RECORDS[0].Tp + RECORDS[0].PR))
      expect(result.next).toBeGreaterThan(result.last)
    })
  })

  describe('getSemiminorAxis()', () => {
    it('should calculate the semiminor axis for the given eccentricity and semimajor', () => {
      const result = getSemiminorAxis(0.05, 123456)

      expect(typeof result).toBe('number')
      expect(result).toBe(123301.58342924879)
    })

    it('should equal the semimajor axis for a circular orbit', () => {
      expect(getSemiminorAxis(0, 123456)).toBe(123456)
    })
  })

  describe('getTychoData()', () => {
    it('should have all Tycho-format properties', () => {
      const props = [
        'argumentOfPeriapsis',
        'eccentricity',
        'longitudeOfAscendingNode',
        'semiminor',
        'semimajor',
        'periapses'
      ]
      const result = getTychoData(SETS, true)

      props.forEach((prop) => {
        expect(result).toHaveProperty(prop)
      })
    })

    it('should convert the axes from AU to km for a heliocentric orbit', () => {
      const result = getTychoData(SETS, true)

      expect(result.semimajor).toBe(RECORDS[0].A * AU_TO_KM)
      expect(result.semiminor).toBe(getSemiminorAxis(RECORDS[0].EC, RECORDS[0].A) * AU_TO_KM)
    })

    it('should leave the axes unscaled for a satellite orbit', () => {
      const result = getTychoData(SETS, false)

      expect(result.semimajor).toBe(RECORDS[0].A)
      expect(result.semiminor).toBe(getSemiminorAxis(RECORDS[0].EC, RECORDS[0].A))
    })

    it('should not scale the elements that are already angles or epochs', () => {
      const heliocentric = getTychoData(SETS, true)
      const satellite = getTychoData(SETS, false)

      expect(heliocentric.argumentOfPeriapsis).toBe(satellite.argumentOfPeriapsis)
      expect(heliocentric.eccentricity).toBe(satellite.eccentricity)
      expect(heliocentric.longitudeOfAscendingNode).toBe(satellite.longitudeOfAscendingNode)
      expect(heliocentric.periapses).toEqual(satellite.periapses)
    })
  })

  describe('getDataFromRaw()', () => {
    it('should return Tycho-format data for a raw NASA response', () => {
      const result = getDataFromRaw(RAW_RESPONSE, EPHEMERIS)

      expect(result).toBeTypeOf('object')
      expect(result).toEqual({
        argumentOfPeriapsis: 273.5899708996587,
        eccentricity: 0.04838072211191377,
        longitudeOfAscendingNode: 100.5116865208267,
        semimajor: 778340415.5801244,
        semiminor: 777428953.4278542,
        periapses: {
          last: 1655799975567.931,
          next: 2030130468469.2354
        }
      })
    })

    it('should treat the sun barycenter code as heliocentric and scale to km', () => {
      const result = getDataFromRaw(RAW_RESPONSE, { ...EPHEMERIS, nasaBarycenterCode: '10' })

      expect(result.semimajor).toBe(RECORDS[0].A * AU_TO_KM)
    })

    it('should leave a satellite orbit around another barycenter unscaled', () => {
      const result = getDataFromRaw(RAW_RESPONSE, { ...EPHEMERIS, nasaBarycenterCode: '699' })

      expect(result.semimajor).toBe(RECORDS[0].A)
    })

    it('should return undefined when the response holds no data sets', () => {
      expect(getDataFromRaw('No matches found.', EPHEMERIS)).toBeUndefined()
    })
  })

  describe('nextOrder()', () => {
    it('should step down through the revolution orders', () => {
      expect(nextOrder('y')).toBe('mo')
      expect(nextOrder('mo')).toBe('d')
      expect(nextOrder('d')).toBe('h')
      expect(nextOrder('h')).toBe('m')
    })

    it('should return undefined for the finest order', () => {
      expect(nextOrder('m')).toBeUndefined()
    })

    it('should return undefined for an unknown order', () => {
      expect(nextOrder('s')).toBeUndefined()
    })
  })

  describe('momentDateOrder()', () => {
    it("should translate the NASA month code to moment's", () => {
      expect(momentDateOrder('mo')).toBe('month')
    })

    it('should pass through orders moment already understands', () => {
      expect(momentDateOrder('y')).toBe('y')
      expect(momentDateOrder('d')).toBe('d')
      expect(momentDateOrder('m')).toBe('m')
    })
  })

  describe('renderDates()', () => {
    const date = moment('2023-02-25T00:00:00Z')

    it('should return the start date formatted for the telnet interface', () => {
      const [start] = renderDates('y', date)

      expect(start).toBe(date.format(DATE_FORMAT))
    })

    it('should place the end date 500 revolutions out', () => {
      const [, end] = renderDates('y', date)

      expect(end).toBe(date.clone().add(500, 'y').format(DATE_FORMAT))
    })

    it("should resolve the `mo` order against moment's month unit", () => {
      const [, end] = renderDates('mo', date)

      expect(end).toBe(date.clone().add(500, 'month').format(DATE_FORMAT))
    })

    it('should not mutate the given date', () => {
      const original = date.format()

      renderDates('y', date)

      expect(date.format()).toBe(original)
    })
  })

  describe('shouldLookupAgain()', () => {
    it('should keep zooming in until the order reaches minutes', () => {
      expect(shouldLookupAgain('y')).toBe(true)
      expect(shouldLookupAgain('d')).toBe(true)
      expect(shouldLookupAgain('m')).toBe(false)
    })
  })

  describe('getRequest()', () => {
    const date = moment('2023-02-25T00:00:00Z')
    const request = getRequest(EPHEMERIS, date)

    it('should open by sending the orbital code at the Horizons prompt', () => {
      expect(request[0].output.source).toBe('Horizons> ')
      expect(request[0].input).toBe('6\r\n')
    })

    it('should drive the interactive sequence in order', () => {
      const [startDate, endDate] = renderDates('y', date)

      expect(request.slice(1, -1).map(({ input }) => input)).toEqual(
        ['E', 'e', '10', 'eclip', startDate, endDate, '1y', 'y'].map((s) => `${s}\r\n`)
      )
    })

    it('should terminate on the computations footer', () => {
      const terminal = request[request.length - 1]

      expect(terminal.output.source).toBe('Computations by')
      expect(terminal.input).toBe('\r\n')
    })

    it('should carry a CRLF on every input', () => {
      request.forEach((entry) => {
        expect(entry.input.endsWith('\r\n')).toBe(true)
      })
    })
  })

  describe('makeRequest()', () => {
    it('should send the rendered request to the NASA telnet host', async () => {
      telnetMock.mockResolvedValue(RAW_RESPONSE)

      const date = moment('2023-02-25T00:00:00Z')
      const result = await makeRequest(EPHEMERIS, date)

      expect(telnetMock).toHaveBeenCalledWith(TELNET_HOST, getRequest(EPHEMERIS, date))
      expect(result).toBe(RAW_RESPONSE)
    })
  })

  describe('requestZoomIn()', () => {
    it('should recurse down to the minute order and return the last periapsis', async () => {
      telnetMock.mockResolvedValue(RAW_RESPONSE)

      const result = await requestZoomIn(EPHEMERIS, moment('2023-02-25T00:00:00Z'))

      expect(result).toBe(getDataFromRaw(RAW_RESPONSE, EPHEMERIS).periapses.last)
    })

    it('should make one request per revolution order from `y` down to `m`', async () => {
      telnetMock.mockResolvedValue(RAW_RESPONSE)

      await requestZoomIn(EPHEMERIS, moment('2023-02-25T00:00:00Z'))

      // y -> mo -> d -> h -> m
      expect(telnetMock).toHaveBeenCalledTimes(5)
    })

    it('should stop immediately when already at the minute order', async () => {
      telnetMock.mockResolvedValue(RAW_RESPONSE)

      await requestZoomIn({ ...EPHEMERIS, revolutionOrder: 'm' }, moment('2023-02-25T00:00:00Z'))

      expect(telnetMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('getEphemeris()', () => {
    it('should return the Tycho data with both periapses zoomed in', async () => {
      telnetMock.mockResolvedValue(RAW_RESPONSE)

      const result = await getEphemeris(EPHEMERIS)
      const { periapses, ...elements } = getDataFromRaw(RAW_RESPONSE, EPHEMERIS)

      expect(result).toEqual({
        ...elements,
        periapses: {
          last: periapses.last,
          next: periapses.last
        }
      })
    })

    it('should reject when the telnet session fails', async () => {
      telnetMock.mockRejectedValue(new Error('Timed out'))

      await expect(getEphemeris(EPHEMERIS)).rejects.toThrow('Timed out')
    })
  })
})
