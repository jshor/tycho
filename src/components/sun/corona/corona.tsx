import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Constants } from '../../../constants'
import { getScreenRadius, getSunBearing, getSunDistance, isSunInFront } from '../../../utils/sun'
import VERTEX_SHADER from '../../../shaders/corona.vert.glsl?raw'
import FRAGMENT_SHADER from '../../../shaders/corona.frag.glsl?raw'

/** The corner directions of the screen to render the corona into. */
export const SCREEN_QUAD: [number, number] = [2, 2]

/**
 * Returns the material the sun's corona is drawn with.
 */
export const createCoronaMaterial = (): THREE.ShaderMaterial => {
  const { COLOR, INTENSITY, BRIGHTNESS, RAY_DETAIL, CORONA_SPREAD, CORONA_CONTRAST } =
    Constants.WebGL.Sun

  return new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      aspectRatio: { value: 1 },
      sunPosition: { value: new THREE.Vector2() },
      sunSize: { value: 0 },
      camAngle: { value: 0 },
      phase: { value: 0 },
      tint: { value: new THREE.Color(COLOR).multiplyScalar(INTENSITY) },
      brightness: { value: BRIGHTNESS },
      rayDetail: { value: RAY_DETAIL },
      coronaSpread: { value: CORONA_SPREAD },
      coronaContrast: { value: CORONA_CONTRAST }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false
  })
}

/**
 * The beaming rays emitted from the sun.
 */
export function Corona() {
  const meshRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>>(null)
  const material = useMemo(() => createCoronaMaterial(), [])
  const cameraPosition = useMemo(() => new THREE.Vector3(), [])
  const heading = useMemo(() => new THREE.Vector3(), [])
  const projected = useMemo(() => new THREE.Vector3(), [])
  const { camera, size } = useThree()

  /**
   * Applies the corona onto the sun mesh.
   */
  useFrame(({ clock }) => {
    const mesh = meshRef.current

    if (!mesh) return

    camera.updateMatrixWorld()

    const distance = getSunDistance(camera, cameraPosition)
    const { aspectRatio, sunPosition, sunSize, camAngle, phase } = mesh.material.uniforms

    mesh.visible = isSunInFront(camera, cameraPosition, heading)

    if (!mesh.visible) return

    const fov = (camera as THREE.PerspectiveCamera).fov ?? Constants.WebGL.Camera.FOV

    projected.set(0, 0, 0).project(camera)

    sunPosition.value.set(projected.x, projected.y)
    sunSize.value = getScreenRadius(distance, fov, size.height)
    aspectRatio.value = size.width / size.height
    camAngle.value = getSunBearing(cameraPosition)
    phase.value = clock.getElapsedTime() * Constants.WebGL.Sun.DRIFT
  })

  return (
    <mesh
      ref={meshRef}
      material={material}
      renderOrder={Constants.WebGL.Sun.RENDER_ORDER}
      frustumCulled={false}
      visible={false}
    >
      <planeGeometry args={SCREEN_QUAD} />
    </mesh>
  )
}
