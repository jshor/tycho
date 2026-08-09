import { glob } from 'glob'
import path from 'node:path'
import fs from 'node:fs'
import { OrbitalData } from '../types'

export const DATA_PATH = path.join(process.cwd(), './public/static/data/orbitals')

/**
 * Returns JSON data from the given file path.
 */
export function getJsonData(filePath: string): OrbitalData {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Extracts the file name from the given file path.
 */
export const getKeyFromPath = (filePath: string) => {
  return filePath.replace(/^.*[\\/]/, '').replace('.json', '')
}

/**
 * Bundles all JSONs from the given paths to one object.
 */
export const jsonFilesToObject = (filePaths: string[]): Record<string, OrbitalData> => {
  return filePaths.reduce(
    (acc, filePath) => ({
      ...acc,
      [getKeyFromPath(filePath)]: getJsonData(filePath)
    }),
    {} satisfies Record<string, OrbitalData>
  )
}

/**
 * Removes satellites from the given object.
 *
 * @param {Object} mapping - with satellites mapped
 * @returns {Object} data with satellites removed
 */
export function removeSatellites(
  mapping: Record<string, OrbitalData>,
  satellites: string[]
): Record<string, OrbitalData> {
  satellites.forEach((satellite) => {
    delete mapping[satellite]
  })
  return mapping
}

/**
 * Maps satellites to their parents.
 */
export function mapSatellitesToParents(
  data: Record<string, OrbitalData>
): Record<string, OrbitalData> {
  const mapping: Record<string, OrbitalData> = {}
  let allSatelliteIds: string[] = []

  for (const id in data) {
    const { satelliteIds } = data[id]

    if (Array.isArray(satelliteIds)) {
      data[id].satellites = satelliteIds
        .filter((satelliteId) => !!data[satelliteId])
        .map((satelliteId) => ({
          id: satelliteId,
          ...data[satelliteId]
        }))

      allSatelliteIds = [
        ...allSatelliteIds,
        ...Object.values(data[id].satellites).map((satellite) => satellite.id)
      ]
    }
    mapping[id] = data[id]
  }

  return removeSatellites(mapping, allSatelliteIds)
}

/**
 * Flattens key-value orbital data structure to array.
 * Assigns the key as the `id` property of the given orbital.
 */
export function orbitalsToArray(orbitalData: Record<string, OrbitalData>): OrbitalData[] {
  const data: OrbitalData[] = []

  for (const id in orbitalData) {
    data.push(Object.assign({}, orbitalData[id], { id }))
  }
  return data
}

/**
 * Returns all *.json files recursively in the given path.
 */
export function getFilePaths(): string[] {
  return glob.sync(`${DATA_PATH}/**/*.json`)
}

/**
 * Compiles data from the given base path.
 */
export function getOrbitalDataBundle(): string {
  const filePaths = getFilePaths()
  const jsonData = jsonFilesToObject(filePaths)
  const orbitalsObj = mapSatellitesToParents(jsonData)
  const orbitalsArr = orbitalsToArray(orbitalsObj)

  return JSON.stringify(orbitalsArr)
}

/**
 * Writes the given data to the location of the specified orbital.
 */
export function compileDataFile(data: string, fileName: string) {
  writeFile(data, `${DATA_PATH}/${fileName}.json`)
}

/**
 * Writes the given data to the specified file.
 */
export function writeFile(data: string, filePath: string) {
  fs.writeFileSync(filePath, data, { flag: 'w' })
}

/**
 * Compiles all bundles.
 */
export function compileBundles() {
  console.log('Compiling orbital data bundle...')

  try {
    compileDataFile(getOrbitalDataBundle(), '../orbitals')
    console.log('✅  Compiled orbital data bundle successfully.')
  } catch (error) {
    console.error('⚠️  Error compiling orbital data bundle: ', error)
  }
}
