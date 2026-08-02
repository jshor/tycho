import { formatDateTime, formatUnixTime, getUnixTime } from '../DateTime'

describe('DateTime Utility', () => {
  /** A time with a two-digit day, a short month and an afternoon hour, in local time. */
  const afternoon = new Date(2024, 0, 15, 13, 45, 9)

  describe('getUnixTime()', () => {
    it('should count the seconds since the epoch', () => {
      expect(getUnixTime(new Date(1_705_000_000_000))).toEqual(1_705_000_000)
    })

    it('should take a time in milliseconds as readily as a date', () => {
      expect(getUnixTime(1_705_000_000_000)).toEqual(1_705_000_000)
    })

    it('should drop the part of a second, rather than round up past it', () => {
      expect(getUnixTime(1_705_000_000_999)).toEqual(1_705_000_000)
    })

    it('should read the clock when it is given no time of its own', () => {
      vi.spyOn(Date, 'now').mockReturnValue(1_705_000_000_500)

      expect(getUnixTime()).toEqual(1_705_000_000)

      vi.restoreAllMocks()
    })
  })

  describe('formatDateTime()', () => {
    it('should read out as the day, the month, the year and the time', () => {
      expect(formatDateTime(afternoon)).toEqual('15 Jan 2024 13:45:09')
    })

    it('should pad the pieces out, so the readout holds its width as it ticks', () => {
      expect(formatDateTime(new Date(2024, 8, 5, 4, 5, 6))).toEqual('05 Sep 2024 04:05:06')
    })

    it('should read midnight as the top of the day rather than the end of the last', () => {
      expect(formatDateTime(new Date(2024, 0, 15, 0, 30, 0))).toEqual('15 Jan 2024 00:30:00')
    })

    it('should take a time in milliseconds as readily as a date', () => {
      expect(formatDateTime(afternoon.getTime())).toEqual('15 Jan 2024 13:45:09')
    })

    it('should read out as nothing at all when there is no time to show', () => {
      expect(formatDateTime(NaN)).toEqual('')
      expect(formatDateTime(new Date('nonsense'))).toEqual('')
    })
  })

  describe('formatUnixTime()', () => {
    it('should read out a time counted in seconds', () => {
      expect(formatUnixTime(getUnixTime(afternoon))).toEqual('15 Jan 2024 13:45:09')
    })
  })
})
