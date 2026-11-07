import * as THREE from 'three'
import orbitals from '../../../public/static/data/orbitals.json'
import { Constants } from '../../constants'
import { OrbitalData } from '../../types'

/** The contrast normal-sized text must hold against its background, per WCAG 1.4.3. */
const MIN_CONTRAST = 4.5

/**
 * Returns the relative luminance of the given color, per WCAG 2.
 */
const getLuminance = (color: THREE.Color): number => {
  // THREE keeps colors in linear space, which is the space luminance is measured in
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b
}

/**
 * Returns the contrast ratio between the two given colors, per WCAG 2.
 */
const getContrast = (a: THREE.Color, b: THREE.Color): number => {
  const [lighter, darker] = [getLuminance(a), getLuminance(b)].sort((x, y) => y - x)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Returns every orbital, its satellites included.
 */
const flatten = (list: OrbitalData[] = []): OrbitalData[] =>
  list.flatMap((orbital) => [orbital, ...flatten(orbital.satellites)])

/** The labels are drawn in WebGL, where axe cannot measure their contrast, so it is measured here. */
describe('label contrast', () => {
  const background = Constants.WebGL.LABEL_BACKGROUND_MATERIAL.color

  it('should back every label with an opaque plane, so its text is only ever read against it', () => {
    expect(Constants.WebGL.LABEL_BACKGROUND_MATERIAL.opacity).toEqual(1)
  })

  const labels = flatten(orbitals as unknown as OrbitalData[]).map((orbital) => [
    orbital.name,
    (orbital as OrbitalData & { labelColor?: number }).labelColor
  ])

  it.each(labels)(
    'should draw the %s label in a color that reads against its backing plane',
    (_, labelColor) => {
      const color = new THREE.Color(labelColor as THREE.ColorRepresentation)

      expect(getContrast(color, background)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  )
})
