import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Constants } from '../../../constants'
import { getApparentRadius } from '../../../utils/camera'

interface Props {
  /** The radius of the orbital marker (in km). */
  radius?: number
  /** The color of the marker. */
  color?: THREE.ColorRepresentation
  /** Whether or not the pointer is resting on the label the marker. */
  hovered?: boolean
}

/**
 * Returns the amount of fade for the marker, w.r.t. the apparent radius of the orbital.
 */
export const getMarkerFade = (apparentRadius: number): number => {
  const { FADE_IN, FADE_OUT } = Constants.WebGL.Marker

  if (apparentRadius <= FADE_IN) {
    return 1
  }

  if (apparentRadius >= FADE_OUT) {
    return 0
  }

  return 1 - (apparentRadius - FADE_IN) / (FADE_OUT - FADE_IN)
}

/**
 * Returns the material a marker is drawn with.
 */
export const createMarkerMaterial = (color: THREE.ColorRepresentation): THREE.Material => {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })
}

/**
 * The visual ring around an orbital to identify it from a distance.
 */
export function Marker({ radius = 0, color = 'white', hovered }: Props) {
  const meshRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material>>(null)
  const glowRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material>>(null)
  const { camera, size } = useThree()
  const material = useMemo(() => createMarkerMaterial(color), [color])
  const glowMaterial = useMemo(() => createMarkerMaterial(color), [color])

  const markerPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraPosition = useMemo(() => new THREE.Vector3(), [])

  const { GLOW_SPREAD, RADIUS, SEGMENTS, THICKNESS } = Constants.WebGL.Marker
  const inner = RADIUS * (1 - THICKNESS)

  /**
   * Fades the marker against how large the body it stands in for has grown on screen.
   */
  useFrame(() => {
    const mesh = meshRef.current
    const glow = glowRef.current

    if (!mesh || !glow) return

    const fov = (camera as THREE.PerspectiveCamera).fov ?? Constants.WebGL.Camera.FOV

    markerPosition.setFromMatrixPosition(mesh.matrixWorld)
    cameraPosition.setFromMatrixPosition(camera.matrixWorld)

    const distance = cameraPosition.distanceTo(markerPosition)
    const fade = getMarkerFade(getApparentRadius(radius, distance, fov, size.height))

    mesh.visible = fade > 0
    glow.visible = mesh.visible && !!hovered
    mesh.material.opacity = fade * Constants.WebGL.LABEL_MATERIAL.opacity
    glow.material.opacity = glow.visible ? fade * Constants.WebGL.LABEL_GLOW.OPACITY : 0
  })

  return (
    <group>
      {/* the halo when hovered */}
      <mesh ref={glowRef} material={glowMaterial} renderOrder={1} visible={false}>
        <ringGeometry args={[inner - GLOW_SPREAD, RADIUS + GLOW_SPREAD, SEGMENTS]} />
      </mesh>

      <mesh
        ref={meshRef}
        material={material}
        renderOrder={1} // draw on top of the backing plane
        visible={false}
      >
        <ringGeometry args={[inner, RADIUS, SEGMENTS]} />
      </mesh>
    </group>
  )
}
