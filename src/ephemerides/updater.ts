import { OrbitalData } from '../types'
import * as compiler from './compiler'
import * as ephemeris from './scraper'
import { Progress } from './progress'

/**
 * Updates the given orbital file with updated ephemeris data.
 */
function updateFileWithEphemeris(path: string, data: OrbitalData) {
  const content = JSON.stringify(data, null, 2)

  compiler.writeFile(content, path)
}

/**
 * Finds all orbital data files and updates them with latest NASA ephemeris data.
 *
 * This will return a list of warnings if any orbital files could not be updated.
 */
async function processOrbitals(
  orbitalPaths: string[],
  progress: Progress,
  warnings: string[] = [],
  index = 0
): Promise<string[]> {
  const orbitalPath = orbitalPaths[index]

  if (!orbitalPath) {
    return warnings
  }

  const orbitalData = compiler.getJsonData(orbitalPath)

  progress.update(index, `Processing ${orbitalData.name}...`)

  const aggregatedWarnings = await (async () => {
    try {
      if (!orbitalData.ephemeris) {
        return [...warnings, `No ephemeris data found for ${orbitalData.name}.`]
      }

      const data = await ephemeris.getEphemeris(orbitalData.ephemeris)

      updateFileWithEphemeris(orbitalPath, { ...orbitalData, ...data })

      return warnings
    } catch (error) {
      return [...warnings, `Error processing ${orbitalData.name}: ${error}`]
    }
  })()

  return processOrbitals(orbitalPaths, progress, aggregatedWarnings, index + 1)
}

/**
 * Updates all orbital files.
 */
export async function updateAll() {
  const orbitalPaths = compiler.getFilePaths()
  const progress = new Progress(orbitalPaths.length)
  const warnings = await processOrbitals(orbitalPaths, progress)

  if (warnings?.length) {
    progress.stop('⚠️  Completed with warnings:')
    warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`)
    })
  } else {
    progress.stop('✅  Completed successfully.')
  }
}
