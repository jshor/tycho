import { useThree, useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useRef, useState, useMemo, useEffect } from 'react'
import { Constants } from '../../../constants'

interface TroikaText extends THREE.Mesh {
  textRenderInfo?: {
    /** [minX, minY, maxX, maxY] of the laid-out block, in the text's local units. */
    blockBounds: [number, number, number, number]
  }
}

interface Props {
  /** Children elements to be rendered inside the text. */
  children?: React.ReactNode
  /** Size of the text. */
  fontSize?: number
  /** Name of the ancestor to measure distance from, when culling a satellite's label. */
  barycenterId?: string
  /** Maximum distance from the barycenter at which the label is visible. */
  maxDistance?: number
  /** How far toward the camera the label stands off from its own origin, in scene units. */
  standoff?: number
  /** Click or tap callback event. */
  onClick?: (event: ThreeEvent<PointerEvent>) => void
  /** Pointer over callback event. */
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void
  /** Pointer out callback event. */
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
  /** Color of the text. */
  color?: THREE.ColorRepresentation
  /** Path to the font file for the text. */
  font?: string
}

/**
 * A WebGL text element that always faces the camera.
 */
export function CameraText({
  children,
  fontSize = 1,
  barycenterId,
  maxDistance,
  standoff = 0,
  color,
  onClick,
  onPointerOver,
  onPointerOut,
  ...props
}: Props) {
  const ref = useRef<TroikaText>(null)
  const groupRef = useRef<THREE.Group>(null)
  const backgroundRef = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const isVisible = useRef(true)
  const pressedAt = useRef<{ x: number; y: number } | null>(null)
  const leaving = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hovered, setHovered] = useState(false)
  const textPosition = useMemo(() => new THREE.Vector3(), [])
  const bodyPosition = useMemo(() => new THREE.Vector3(), [])
  const toCamera = useMemo(() => new THREE.Vector3(), [])
  const barycenterPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const cameraScale = useMemo(() => new THREE.Vector3(), [])
  const parentQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const inverseParent = useMemo(() => new THREE.Quaternion(), [])
  const parentScale = useMemo(() => new THREE.Vector3(), [])

  /**
   * Applies the threshold range to the given group to apply its hover state.
   *
   * This will ultimately return whether or not the label is within the range of view.
   */
  const applyRangeHoverState = (group: THREE.Group): boolean => {
    if (!barycenterId || maxDistance === undefined || !isFinite(maxDistance)) {
      return true
    }

    const barycenter = group.parent && findAncestorByName(group.parent, barycenterId)

    if (!barycenter) {
      return true
    }

    barycenter.getWorldPosition(barycenterPosition)

    const withinRange = cameraPosition.distanceTo(barycenterPosition) <= maxDistance

    isVisible.current = withinRange
    group.visible = withinRange

    if (!withinRange && hovered) {
      setHovered(false)
    }

    return withinRange
  }

  /**
   * Reads the world matrix positions of the orbital into the given parent.
   */
  const readBodyTransformations = (parent: THREE.Object3D): void => {
    parent.updateWorldMatrix(true, false)
    parent.getWorldPosition(bodyPosition)
    parent.getWorldScale(parentScale)
    parent.getWorldQuaternion(parentQuaternion)
  }

  /**
   * Offsets the label from the orbital that it belongs to.
   */
  const offsetFromOrbital = (group: THREE.Group): void => {
    toCamera.subVectors(cameraPosition, bodyPosition)

    if (standoff <= 0 || toCamera.lengthSq() === 0) {
      textPosition.copy(bodyPosition)
      group.position.set(0, 0, 0)
      return
    }

    const offset = Math.max(standoff, toCamera.length() * Constants.WebGL.LABEL_DEPTH_BIAS)

    toCamera.normalize()
    textPosition.copy(bodyPosition).addScaledVector(toCamera, offset)
    inverseParent.copy(parentQuaternion).invert()

    group.position
      .copy(toCamera)
      .applyQuaternion(inverseParent)
      .multiplyScalar(offset / parentScale.x)
  }

  /**
   * Scales the label to cover the same span of screen.
   */
  const scaleLabelToScreen = (group: THREE.Group, distance: number): void => {
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
    const visibleHeight = 2 * distance * Math.tan(fov / 2)
    const visibleWidth = visibleHeight * (size.width / size.height)
    const worldSize = (fontSize * visibleWidth) / size.width

    group.scale.set(worldSize / parentScale.x, worldSize / parentScale.y, worldSize / parentScale.z)
  }

  /**
   * Turns the label orthogonally to face to the camera.
   */
  const faceCamera = (group: THREE.Group): void => {
    group.quaternion.copy(parentQuaternion).invert().multiply(cameraQuaternion)
  }

  /**
   * Applies the background to the label.
   */
  const applyBackgroundPlane = (text: TroikaText): void => {
    const background = backgroundRef.current
    const bounds = text.textRenderInfo?.blockBounds

    if (!background || !bounds) return

    const [minX, minY, maxX, maxY] = bounds
    const padding = fontSize * Constants.WebGL.LABEL_BACKGROUND_PADDING

    background.scale.set(maxX - minX + padding * 2, maxY - minY + padding * 2, 1)
    background.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0)
  }

  /**
   * Updates the label's position, scale, and orientation each frame.
   */
  useFrame(() => {
    const text = ref.current
    const group = groupRef.current
    const parent = group?.parent

    if (!text || !group || !parent) return

    // where the camera is and how it is turned, which everything below is placed against
    camera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale)

    // nothing to place while out of range
    if (!applyRangeHoverState(group)) return

    readBodyTransformations(parent)
    offsetFromOrbital(group)

    const distance = cameraPosition.distanceTo(textPosition)

    // nearer labels are drawn last, so that they come out on top of the ones further off
    group.renderOrder = Constants.WebGL.LABEL_RENDER_ORDER - distance

    scaleLabelToScreen(group, distance)
    faceCamera(group)
    applyBackgroundPlane(text)
  })

  /**
   * Label press (click or touch)event handler.
   */
  const onPress = (event: ThreeEvent<PointerEvent>) => {
    if (!isVisible.current) return

    const target = event.target as Element

    event.stopPropagation()
    target?.setPointerCapture?.(event.pointerId)
    pressedAt.current = { x: event.clientX, y: event.clientY }
  }

  /**
   * Label release (click or touch) event handler
   *
   * Note: this counts as a tap if the finger barely moved.
   */
  const onRelease = (event: ThreeEvent<PointerEvent>) => {
    const pressed = pressedAt.current
    const target = event.target as Element

    target?.releasePointerCapture?.(event.pointerId)
    pressedAt.current = null

    if (!pressed || !isVisible.current) return

    const drift = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y)

    if (drift > Constants.UI.FAT_FINGER) return

    event.stopPropagation()
    onClick?.(event)
  }

  /**
   * Abandons a departure the pointer has not seen through.
   */
  const cancelLeaving = () => {
    if (leaving.current !== null) {
      clearTimeout(leaving.current)
      leaving.current = null
    }
  }

  /**
   * Label hover (mouseover or touch)event handler.
   */
  const onHover = (event: ThreeEvent<PointerEvent>) => {
    if (!isVisible.current) return

    cancelLeaving()
    event.stopPropagation()
    setHovered(true)
    onPointerOver?.(event)
  }

  /**
   * Label leave (mouseleave or touch) event handler.
   *
   * This has a timeout to keep the label highlighted until its expiry (to circumvent UI flickering).
   */
  const onLeave = (event: ThreeEvent<PointerEvent>) => {
    cancelLeaving()

    leaving.current = setTimeout(() => {
      leaving.current = null
      setHovered(false)
      onPointerOut?.(event)
    }, Constants.UI.HOVER_LINGER)
  }

  // a label that goes away mid-departure would otherwise leave the timer to fire into nothing
  useEffect(() => cancelLeaving, [])

  return (
    <group
      ref={groupRef}
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerOver={onHover}
      onPointerOut={onLeave}
    >
      <mesh
        ref={backgroundRef}
        material={Constants.WebGL.LABEL_BACKGROUND_MATERIAL}
        renderOrder={0} // render behind the text
      >
        <planeGeometry args={[1, 1]} />
      </mesh>

      <Text
        ref={ref}
        fontSize={fontSize}
        material={Constants.WebGL.LABEL_MATERIAL}
        renderOrder={1} // render on top of the mesh
        color={color}
        outlineColor={color}
        outlineWidth={hovered ? Constants.WebGL.LABEL_GLOW.WIDTH : 0}
        outlineBlur={hovered ? Constants.WebGL.LABEL_GLOW.BLUR : 0}
        outlineOpacity={hovered ? Constants.WebGL.LABEL_GLOW.OPACITY : 0}
        {...props}
      >
        {children}
      </Text>
    </group>
  )
}

/**
 * Returns the first ancestor of a given `Object3D` having the given name.
 */
function findAncestorByName(from: THREE.Object3D, name: string): THREE.Object3D | null {
  for (let node: THREE.Object3D | null = from; node; node = node.parent) {
    if (node.name === name) {
      return node
    }
  }
  return null
}
