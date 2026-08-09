import * as compiler from '../compiler'
import * as ephemeris from '../scraper'
import { Progress } from '../progress'
import { updateAll } from '../updater'

const { progress } = vi.hoisted(() => ({
  progress: {
    update: vi.fn(),
    stop: vi.fn()
  }
}))

vi.mock('../compiler', () => ({
  getFilePaths: vi.fn(),
  getJsonData: vi.fn(),
  writeFile: vi.fn()
}))

vi.mock('../scraper', () => ({
  getEphemeris: vi.fn()
}))

vi.mock('../progress', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  Progress: vi.fn(function () {
    return progress
  })
}))

const getFilePaths = vi.mocked(compiler.getFilePaths)
const getJsonData = vi.mocked(compiler.getJsonData)
const writeFile = vi.mocked(compiler.writeFile)
const getEphemeris = vi.mocked(ephemeris.getEphemeris)

const EPHEMERIS = {
  nasaOrbitalCode: '6',
  nasaBarycenterCode: '10',
  revolutionOrder: 'y'
}

const TYCHO_DATA = {
  argumentOfPeriapsis: 273.5899708996587,
  eccentricity: 0.04838072211191377,
  longitudeOfAscendingNode: 100.5116865208267,
  semimajor: 778340415.5801244,
  semiminor: 777428953.4278542,
  periapses: { last: 1655799975567, next: 2030130468469 }
}

const stubOrbitals = (orbitals: Record<string, unknown>) => {
  getFilePaths.mockReturnValue(Object.keys(orbitals))
  getJsonData.mockImplementation((path: string) => orbitals[path] as never)
}

describe('Ephemeris Updater', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    getEphemeris.mockResolvedValue(TYCHO_DATA)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('updateAll()', () => {
    it('should size the progress bar to the number of orbital files', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS }
      })

      await updateAll()

      expect(Progress).toHaveBeenCalledWith(2)
    })

    it('should report progress for each orbital in turn', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS }
      })

      await updateAll()

      expect(progress.update.mock.calls).toEqual([
        [0, 'Processing Saturn...'],
        [1, 'Processing Titan...']
      ])
    })

    it('should request ephemeris data for every orbital that declares it', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS },
        'titan.json': { name: 'Titan', ephemeris: { ...EPHEMERIS, nasaOrbitalCode: '606' } }
      })

      await updateAll()

      expect(getEphemeris.mock.calls).toEqual([
        [EPHEMERIS],
        [{ ...EPHEMERIS, nasaOrbitalCode: '606' }]
      ])
    })

    it('should merge the ephemeris data into the orbital file', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', radius: 58232, ephemeris: EPHEMERIS }
      })

      await updateAll()

      expect(writeFile).toHaveBeenCalledWith(
        JSON.stringify(
          { name: 'Saturn', radius: 58232, ephemeris: EPHEMERIS, ...TYCHO_DATA },
          null,
          2
        ),
        'saturn.json'
      )
    })

    it('should report success when every orbital updates', async () => {
      stubOrbitals({ 'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS } })

      await updateAll()

      expect(progress.stop).toHaveBeenCalledWith('✅  Completed successfully.')
      expect(console.log).not.toHaveBeenCalled()
    })

    it('should warn and skip the write when an orbital has no ephemeris block', async () => {
      stubOrbitals({ 'saturn.json': { name: 'Saturn' } })

      await updateAll()

      expect(getEphemeris).not.toHaveBeenCalled()
      expect(writeFile).not.toHaveBeenCalled()
      expect(progress.stop).toHaveBeenCalledWith('⚠️  Completed with warnings:')
      expect(console.log).toHaveBeenCalledWith('  1. No ephemeris data found for Saturn.')
    })

    it('should warn and skip the write when the ephemeris lookup fails', async () => {
      stubOrbitals({ 'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS } })
      getEphemeris.mockRejectedValue(new Error('Timed out'))

      await updateAll()

      expect(writeFile).not.toHaveBeenCalled()
      expect(progress.stop).toHaveBeenCalledWith('⚠️  Completed with warnings:')
      expect(console.log).toHaveBeenCalledWith('  1. Error processing Saturn: Error: Timed out')
    })

    it('should carry on to the remaining orbitals after a failure', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS }
      })
      getEphemeris.mockRejectedValueOnce(new Error('Timed out'))

      await updateAll()

      expect(getEphemeris).toHaveBeenCalledTimes(2)
      expect(writeFile).toHaveBeenCalledTimes(1)
      expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('Titan'), 'titan.json')
    })

    it('should keep warnings raised before a later orbital succeeds', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn' },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS }
      })

      await updateAll()

      expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('Titan'), 'titan.json')
      expect(progress.stop).toHaveBeenCalledWith('⚠️  Completed with warnings:')
      expect(console.log).toHaveBeenCalledWith('  1. No ephemeris data found for Saturn.')
    })

    it('should number every warning across the whole run', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn' },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS },
        'rhea.json': { name: 'Rhea', ephemeris: EPHEMERIS },
        'mimas.json': { name: 'Mimas' }
      })
      getEphemeris.mockRejectedValueOnce(new Error('Timed out'))

      await updateAll()

      expect(vi.mocked(console.log).mock.calls).toEqual([
        ['  1. No ephemeris data found for Saturn.'],
        ['  2. Error processing Titan: Error: Timed out'],
        ['  3. No ephemeris data found for Mimas.']
      ])
    })

    it('should report a clean run when there are no orbital files', async () => {
      getFilePaths.mockReturnValue([])

      await expect(updateAll()).resolves.toBeUndefined()

      expect(Progress).toHaveBeenCalledWith(0)
      expect(getJsonData).not.toHaveBeenCalled()
      expect(progress.update).not.toHaveBeenCalled()
      expect(progress.stop).toHaveBeenCalledWith('✅  Completed successfully.')
    })

    it('should stop at the end of the list rather than reading past it', async () => {
      stubOrbitals({
        'saturn.json': { name: 'Saturn', ephemeris: EPHEMERIS },
        'titan.json': { name: 'Titan', ephemeris: EPHEMERIS }
      })

      await updateAll()

      expect(getJsonData.mock.calls).toEqual([['saturn.json'], ['titan.json']])
    })
  })
})
