import { useMemo } from 'react'
import * as THREE from 'three'
import { Scale, getVisibleRadius } from '../../../utils/Scale'
import { Constants } from '../../../constants'
import { AtmosphereEntry } from '../../../constants/WebGL'
import VERTEX_SHADER from '../../../shaders/atmosphere.vert.glsl?raw'
import FRAGMENT_SHADER from '../../../shaders/atmosphere.frag.glsl?raw'

interface Props {
  /** Radius of the body being wrapped, in km. */
  radius: number
  /** Colour the scattered light takes on — the orbital's `atmosphere` colour. */
  color: number
  /** Scattering parameters for this particular body. */
  settings: AtmosphereEntry
}

/**
 * A thin glowing shell around a body that approximates atmospheric (Rayleigh) scattering.
 */
export function Atmosphere({ radius, color, settings }: Props) {
  const surface = Scale(getVisibleRadius(radius))
  const shellRadius = surface * (1 + settings.THICKNESS)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        color: { value: new THREE.Color(color) },
        duskColor: { value: new THREE.Color(settings.DUSK_COLOR) },
        power: { value: settings.POWER },
        intensity: { value: settings.INTENSITY },
        terminatorSoftness: { value: settings.TERMINATOR_SOFTNESS }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  }, [color, settings])

  return (
    <mesh material={material}>
      <sphereGeometry
        args={[shellRadius, Constants.WebGL.SPHERE_SEGMENTS, Constants.WebGL.SPHERE_SEGMENTS]}
      />
    </mesh>
  )
}
