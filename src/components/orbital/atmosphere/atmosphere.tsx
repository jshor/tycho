import { useMemo } from 'react'
import * as THREE from 'three'
import { Scale, getVisibleRadius } from '../../../utils/Scale'
import { Constants } from '../../../constants'
import VERTEX_SHADER from '../../../shaders/atmosphere.vert.glsl?raw'
import FRAGMENT_SHADER from '../../../shaders/atmosphere.frag.glsl?raw'

interface Props {
  /** Radius of the body being wrapped, in km. */
  radius: number
  /** How far this body's atmosphere reaches above its surface, in km. */
  height: number
  /** Colour the scattered light takes on — the orbital's `atmosphereColor`. */
  color: string
}

/**
 * Returns the radius of the shell drawn around a body of the given radius, in scene units.
 */
export const getShellRadius = (radius: number, height: number): number => {
  const visible = getVisibleRadius(radius)
  const raised = height * Constants.WebGL.Atmosphere.HEIGHT_SCALE

  return Scale(visible + raised * (visible / radius))
}

/**
 * Returns the radius of the body itself, in scene units: where its atmosphere stops.
 */
export const getSurfaceRadius = (radius: number): number => Scale(getVisibleRadius(radius))

/**
 * Returns the material the shell is drawn with, scattering into the given colour.
 */
export const createAtmosphereMaterial = (
  color: string,
  surfaceRadius: number,
  shellRadius: number
): THREE.ShaderMaterial => {
  const { POWER, INTENSITY, TERMINATOR_SOFTNESS, DUSK_COLOR, DENSITY_FALLOFF, DEPTH_BIAS } =
    Constants.WebGL.Atmosphere

  return new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      color: { value: new THREE.Color(color) },
      duskColor: { value: new THREE.Color(DUSK_COLOR) },
      power: { value: POWER },
      intensity: { value: INTENSITY },
      terminatorSoftness: { value: TERMINATOR_SOFTNESS },
      surfaceRadius: { value: surfaceRadius },
      shellRadius: { value: shellRadius },
      densityFalloff: { value: DENSITY_FALLOFF }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: -DEPTH_BIAS,
    polygonOffsetUnits: -DEPTH_BIAS
  })
}

/**
 * A thin glowing shell around a body that approximates atmospheric (Rayleigh) scattering.
 */
export function Atmosphere({ radius, height, color }: Props) {
  const shellRadius = getShellRadius(radius, height)
  const surfaceRadius = getSurfaceRadius(radius)

  const material = useMemo(
    () => createAtmosphereMaterial(color, surfaceRadius, shellRadius),
    [color, surfaceRadius, shellRadius]
  )

  return (
    <mesh material={material}>
      <sphereGeometry
        args={[shellRadius, Constants.WebGL.SPHERE_SEGMENTS, Constants.WebGL.SPHERE_SEGMENTS]}
      />
    </mesh>
  )
}
