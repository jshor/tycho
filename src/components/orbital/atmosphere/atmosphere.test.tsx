import * as THREE from 'three'
import { renderInScene } from '../../../test/helpers'
import { Constants } from '../../../constants'
import { Scale } from '../../../utils/scale'
import {
  Atmosphere,
  createAtmosphereMaterial,
  getShellRadius,
  getSurfaceRadius
} from './atmosphere'

describe('Atmosphere Component', () => {
  /** Earth, whose atmosphere the data has reaching 100km above a 6,371km surface. */
  const EARTH = { radius: 6371, height: 100, color: '#5DA9E9' }

  const SURFACE = getSurfaceRadius(EARTH.radius)
  const SHELL = getShellRadius(EARTH.radius, EARTH.height)

  describe('getShellRadius()', () => {
    const { HEIGHT_SCALE } = Constants.WebGL.Atmosphere

    it('should stand the shell off the surface by the height it is given', () => {
      const raised = EARTH.height * HEIGHT_SCALE

      expect(getShellRadius(EARTH.radius, EARTH.height)).toBeCloseTo(Scale(EARTH.radius + raised))
    })

    it('should draw the shell at whatever multiple of life it is tuned to', () => {
      const shell = getShellRadius(EARTH.radius, EARTH.height)

      expect(shell - getSurfaceRadius(EARTH.radius)).toBeCloseTo(Scale(EARTH.height * HEIGHT_SCALE))
      expect(shell).toBeGreaterThan(getSurfaceRadius(EARTH.radius))
    })

    it('should stand a thicker atmosphere further off', () => {
      const thin = getShellRadius(EARTH.radius, 100)
      const thick = getShellRadius(EARTH.radius, 3000)

      expect(thick).toBeGreaterThan(thin)
    })

    it('should hold the shell to the surface when there is no atmosphere to speak of', () => {
      expect(getShellRadius(EARTH.radius, 0)).toBeCloseTo(Scale(EARTH.radius))
    })

    it('should inflate the atmosphere of a body drawn inflated, so it clears the surface', () => {
      const { MINIMUM_RADIUS } = Constants.WebGL
      const tiny = MINIMUM_RADIUS / 10

      // the body is drawn ten times over to be seen at all, so its atmosphere is too
      expect(getShellRadius(tiny, 50)).toBeCloseTo(Scale(MINIMUM_RADIUS + 500 * HEIGHT_SCALE))
    })
  })

  describe('createAtmosphereMaterial()', () => {
    it('should scatter the light into the colour the body is given', () => {
      const { uniforms } = createAtmosphereMaterial('#5DA9E9', SURFACE, SHELL)

      expect(uniforms.color.value).toEqual(new THREE.Color('#5DA9E9'))
    })

    it('should scatter every atmosphere by the terms they share', () => {
      const { uniforms } = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)
      const { POWER, INTENSITY, TERMINATOR_SOFTNESS, DUSK_COLOR } = Constants.WebGL.Atmosphere

      expect(uniforms.power.value).toEqual(POWER)
      expect(uniforms.intensity.value).toEqual(INTENSITY)
      expect(uniforms.terminatorSoftness.value).toEqual(TERMINATOR_SOFTNESS)
      expect(uniforms.duskColor.value).toEqual(new THREE.Color(DUSK_COLOR))
    })

    it('should draw the shell over the body rather than into it', () => {
      const material = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(material.transparent).toBe(true)
      expect(material.depthWrite).toBe(false)
      expect(material.blending).toEqual(THREE.AdditiveBlending)
    })

    it('should measure each sight line against the shell it passes through', () => {
      const { uniforms } = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(uniforms.surfaceRadius.value).toBeCloseTo(SURFACE)
      expect(uniforms.shellRadius.value).toBeCloseTo(SHELL)
      expect(uniforms.shellRadius.value).toBeGreaterThan(uniforms.surfaceRadius.value)
    })

    it('should thin the haze over a disc lit from behind the eye', () => {
      const { uniforms } = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(uniforms.headOnFade.value).toEqual(Constants.WebGL.Atmosphere.HEAD_ON_FADE)
    })

    it('should thin the air with height, so the glow fades before the shell ends', () => {
      const { uniforms } = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(uniforms.densityFalloff.value).toEqual(Constants.WebGL.Atmosphere.DENSITY_FALLOFF)
      expect(uniforms.densityFalloff.value).toBeGreaterThan(0)
    })

    it('should lay the glow down once per sight line, rather than over itself', () => {
      const material = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(material.side).toEqual(THREE.FrontSide)
    })

    it('should nudge the shell ahead of the body, which the depth buffer cannot separate at range', () => {
      const material = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)
      const { DEPTH_BIAS } = Constants.WebGL.Atmosphere

      expect(material.polygonOffset).toBe(true)
      // toward the camera, so the shell wins wherever the two land on the same depth
      expect(material.polygonOffsetFactor).toEqual(-DEPTH_BIAS)
      expect(material.polygonOffsetUnits).toEqual(-DEPTH_BIAS)
      expect(DEPTH_BIAS).toBeGreaterThan(0)
    })

    it('should be built from the shaders that draw the scattering', () => {
      const material = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      expect(material.vertexShader).toContain('vViewNormal')
      expect(material.fragmentShader).toContain('terminatorSoftness')
    })

    it('should place the shell against the camera, as three places the body it wraps', () => {
      const material = createAtmosphereMaterial(EARTH.color, SURFACE, SHELL)

      // reaching the same place via viewMatrix * modelMatrix asks a float32 to hold a body's whole
      // distance from the sun, which throws the far planets' shells into their own surfaces
      expect(material.vertexShader).toContain('modelViewMatrix * vec4(position, 1.0)')
      expect(material.vertexShader).not.toContain('viewMatrix * worldPosition')
    })
  })

  describe('render()', () => {
    it('should draw a shell around the body', () => {
      const { container } = renderInScene(<Atmosphere {...EARTH} />)

      expect(container.querySelector('mesh sphereGeometry')).not.toBeNull()
    })
  })
})
