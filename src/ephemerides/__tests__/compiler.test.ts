import fs from 'node:fs'
import { glob } from 'glob'
import {
  DATA_PATH,
  compileBundles,
  compileDataFile,
  getFilePaths,
  getJsonData,
  getKeyFromPath,
  getOrbitalDataBundle,
  jsonFilesToObject,
  mapSatellitesToParents,
  orbitalsToArray,
  removeSatellites,
  writeFile
} from '../compiler'
import { ORBITAL_JSON, makeFlatOrbitals, orbital } from './__fixtures__/orbitals'

vi.mock('glob', () => ({
  glob: { sync: vi.fn() }
}))

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}))

const globSync = vi.mocked(glob.sync)
const readFileSync = vi.mocked(fs.readFileSync)
const writeFileSync = vi.mocked(fs.writeFileSync)

describe('Orbital Compiler', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('getKeyFromPath()', () => {
    it('should return the file name without the json extension', () => {
      const result = getKeyFromPath('./path/to/file.json')

      expect(typeof result).toBe('string')
      expect(result).toBe('file')
    })

    it('should return the file name for a bare file name', () => {
      expect(getKeyFromPath('file.json')).toBe('file')
    })

    it('should handle windows-style separators', () => {
      expect(getKeyFromPath('path\\to\\file.json')).toBe('file')
    })
  })

  describe('getJsonData()', () => {
    it('should parse the JSON at the given path', () => {
      readFileSync.mockReturnValue(ORBITAL_JSON)

      const result = getJsonData('/data/saturn.json')

      expect(readFileSync).toHaveBeenCalledWith('/data/saturn.json', 'utf-8')
      expect(result).toEqual(JSON.parse(ORBITAL_JSON))
    })
  })

  describe('jsonFilesToObject()', () => {
    it("should key each file's contents by its file name", () => {
      readFileSync.mockReturnValueOnce('{"name":"Saturn"}').mockReturnValueOnce('{"name":"Titan"}')

      const result = jsonFilesToObject(['/data/saturn/saturn.json', '/data/saturn/titan.json'])

      expect(result).toEqual({
        saturn: { name: 'Saturn' },
        titan: { name: 'Titan' }
      })
    })

    it('should return an empty object for no file paths', () => {
      expect(jsonFilesToObject([])).toEqual({})
    })
  })

  describe('removeSatellites()', () => {
    let result: Record<string, unknown>

    beforeEach(() => {
      result = removeSatellites({ saturn: orbital({}), io: orbital({}) }, ['io'])
    })

    it('should remove the property `io`', () => {
      expect(result).toBeTypeOf('object')
      expect(result).not.toHaveProperty('io')
    })

    it('should keep the property `saturn`', () => {
      expect(result).toBeTypeOf('object')
      expect(result).toHaveProperty('saturn')
    })

    it('should ignore satellites that are not in the mapping', () => {
      expect(removeSatellites({ saturn: orbital({}) }, ['io'])).toEqual({ saturn: {} })
    })
  })

  describe('mapSatellitesToParents()', () => {
    let result: ReturnType<typeof mapSatellitesToParents>

    beforeEach(() => {
      result = mapSatellitesToParents(makeFlatOrbitals())
    })

    it('should map the `child` satellite into the `satellites` property', () => {
      expect(result.dummy).toHaveProperty('satellites')
      expect(Array.isArray(result.dummy.satellites)).toBe(true)
      expect(result.dummy.satellites[0]).toBeTypeOf('object')
      expect(result.dummy.satellites[0]).toHaveProperty('id')
      expect(result.dummy.satellites[0].id).toBe('child')
    })

    it('should resolve the satellite to its own data', () => {
      expect(result.dummy.satellites[0]).toMatchObject({
        id: 'child',
        name: 'Child',
        radius: 10
      })
    })

    it('should lift the satellite out of the top level', () => {
      expect(result).not.toHaveProperty('child')
      expect(Object.keys(result)).toEqual(['dummy'])
    })

    it('should keep the ids it resolved the satellites from', () => {
      expect(result.dummy.satelliteIds).toEqual(['child'])
    })

    it('should drop satellite ids that have no data file', () => {
      const result = mapSatellitesToParents({
        dummy: orbital({ name: 'Dummy', satelliteIds: ['child', 'ghost'] }),
        child: orbital({ name: 'Child' })
      })

      expect(result.dummy.satellites).toEqual([{ id: 'child', name: 'Child' }])
    })

    it('should leave orbitals without satellite ids untouched', () => {
      expect(mapSatellitesToParents({ dummy: orbital({ name: 'Dummy' }) })).toEqual({
        dummy: { name: 'Dummy' }
      })
    })
  })

  describe('orbitalsToArray()', () => {
    it('should flatten the data into an array', () => {
      const result = orbitalsToArray(makeFlatOrbitals())

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)

      result.forEach((orbital) => {
        expect(orbital).toBeTypeOf('object')
        expect(orbital).toHaveProperty('id')
      })
    })

    it('should assign the key as the `id` of each orbital', () => {
      expect(orbitalsToArray(makeFlatOrbitals()).map(({ id }) => id)).toEqual(['dummy', 'child'])
    })

    it('should not mutate the given data', () => {
      const orbitals = makeFlatOrbitals()

      orbitalsToArray(orbitals)

      expect(orbitals.dummy).not.toHaveProperty('id')
    })
  })

  describe('getFilePaths()', () => {
    it('should glob every json file under the data path', () => {
      globSync.mockReturnValue(['/data/saturn/saturn.json'])

      const result = getFilePaths()

      expect(globSync).toHaveBeenCalledWith(`${DATA_PATH}/**/*.json`)
      expect(result).toEqual(['/data/saturn/saturn.json'])
    })
  })

  describe('getOrbitalDataBundle()', () => {
    it('should return the satellite-mapped orbitals as a JSON string', () => {
      globSync.mockReturnValue(['/data/dummy.json', '/data/child.json'])
      readFileSync
        .mockReturnValueOnce('{"name":"Dummy","satelliteIds":["child"]}')
        .mockReturnValueOnce('{"name":"Child"}')

      const result = getOrbitalDataBundle()

      expect(JSON.parse(result)).toEqual([
        {
          id: 'dummy',
          name: 'Dummy',
          satelliteIds: ['child'],
          satellites: [{ id: 'child', name: 'Child' }]
        }
      ])
    })
  })

  describe('writeFile()', () => {
    it('should overwrite the file at the given path', () => {
      writeFile('{}', '/data/orbitals.json')

      expect(writeFileSync).toHaveBeenCalledWith('/data/orbitals.json', '{}', { flag: 'w' })
    })
  })

  describe('compileDataFile()', () => {
    it('should write the data to the named file under the data path', () => {
      compileDataFile('[]', '../orbitals')

      expect(writeFileSync).toHaveBeenCalledWith(`${DATA_PATH}/../orbitals.json`, '[]', {
        flag: 'w'
      })
    })
  })

  describe('compileBundles()', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should write the orbital bundle', () => {
      globSync.mockReturnValue(['/data/dummy.json'])
      readFileSync.mockReturnValue('{"name":"Dummy"}')

      compileBundles()

      expect(writeFileSync).toHaveBeenCalledWith(
        `${DATA_PATH}/../orbitals.json`,
        JSON.stringify([{ name: 'Dummy', id: 'dummy' }]),
        { flag: 'w' }
      )
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should log the failure rather than throw when compilation fails', () => {
      const error = new Error('ENOENT')

      globSync.mockReturnValue(['/data/dummy.json'])
      readFileSync.mockImplementation(() => {
        throw error
      })

      expect(() => compileBundles()).not.toThrow()
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error compiling orbital data bundle'),
        error
      )
    })
  })
})
