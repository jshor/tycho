import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import Constants from '../../../constants'
import { OrbitalLabelActions } from '../../../types'

interface Props {
  /** The text to display in the label. */
  text: string
  /** The unique identifier for the label. */
  id: string
  /** The color of the label's text, which the orbital wears elsewhere in the scene too. */
  color?: THREE.ColorRepresentation
  /** The action associated with the label. */
  action: OrbitalLabelActions
  /** The target identifier for the label. */
  targetId?: string
  /** The parent identifier for the label. */
  parentId?: string
  /** Whether the label is for a satellite. */
  isSatellite?: boolean
  /** The identifier for the barycenter of the label. */
  maxDistance?: number
}

interface TroikaText extends THREE.Mesh {
  textRenderInfo?: {
    /** [minX, minY, maxX, maxY] of the laid-out block, in the text's local units. */
    blockBounds: [number, number, number, number]
  }
}

interface CameraFacingTextProps {
  children?: React.ReactNode
  fontSize?: number
  /** Name of the ancestor to measure distance from, when culling a satellite's label. */
  barycenterId?: string
  maxDistance?: number
  onClick?: (event: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (event: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (event: ThreeEvent<PointerEvent>) => void
  color?: THREE.ColorRepresentation
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'middle' | 'bottom'
  font?: string
}

/** The THREE.js material used for the label text. */
const LABEL_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  depthTest: false,
  depthWrite: false
})

/** The glow effect when the text is hovered, which takes the color of the text it surrounds. */
const GLOW = {
  WIDTH: '2%',
  BLUR: '60%',
  OPACITY: 0.85
}

/** An opaque, black background to prevent the labels from looking smushed together. */
const BACKGROUND_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.FrontSide,
  transparent: true,
  opacity: Constants.UI.HOVER_OPACITY_OFF,
  depthTest: false,
  depthWrite: false
})

/** Padding for the background overlay (in px?). */
const BACKGROUND_PADDING = 0.3

/**
 * Finds the first ancestor of a given `Object3D` having the given name.
 */
const findAncestorByName = (from: THREE.Object3D, name: string): THREE.Object3D | null => {
  for (let node: THREE.Object3D | null = from; node; node = node.parent) {
    if (node.name === name) {
      return node
    }
  }
  return null
}

/**
 * A WebGL text element that always faces the camera.
 */
export function CameraFacingText({
  children,
  fontSize = 1,
  barycenterId,
  maxDistance,
  color,
  onClick,
  onPointerOver,
  onPointerOut,
  ...props
}: CameraFacingTextProps) {
  const ref = useRef<TroikaText>(null)
  const groupRef = useRef<THREE.Group>(null)
  const backgroundRef = useRef<THREE.Mesh>(null)
  const { camera, size } = useThree()
  const isVisible = useRef(true)
  const pressedAt = useRef<{ x: number; y: number } | null>(null)
  const leaving = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hovered, setHovered] = useState(false)
  const textPosition = useMemo(() => new THREE.Vector3(), [])
  const barycenterPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraPosition = useMemo(() => new THREE.Vector3(), [])
  const cameraQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const cameraScale = useMemo(() => new THREE.Vector3(), [])
  const parentQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const parentScale = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const text = ref.current
    const group = groupRef.current

    if (!text || !group?.parent) return

    // re-orients the label to face the camera and scales it to maintain a constant size on screen
    camera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale)

    if (barycenterId && maxDistance !== undefined && isFinite(maxDistance)) {
      const barycenter = findAncestorByName(group.parent, barycenterId)

      if (barycenter) {
        barycenter.getWorldPosition(barycenterPosition)

        const withinRange = cameraPosition.distanceTo(barycenterPosition) <= maxDistance

        isVisible.current = withinRange
        group.visible = withinRange

        if (!withinRange) {
          // nothing to orient or scale while hidden
          if (hovered) {
            setHovered(false)
          }
          return
        }
      }
    }

    group.parent.updateWorldMatrix(true, false)
    group.getWorldPosition(textPosition)

    const distance = cameraPosition.distanceTo(textPosition)
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov)
    const visibleHeight = 2 * distance * Math.tan(fov / 2)
    const visibleWidth = visibleHeight * (size.width / size.height)
    const worldSize = (fontSize * visibleWidth) / size.width

    group.renderOrder = 1000000 - distance

    // cancel scaling inherited from nested parents
    group.parent.getWorldScale(parentScale)
    group.scale.set(worldSize / parentScale.x, worldSize / parentScale.y, worldSize / parentScale.z)

    // face the camera, to make the label's world orientation equal the camera's (parallel to the
    // image plane, upright), compensating for the rotated orbital groups it is nested under
    group.parent.getWorldQuaternion(parentQuaternion)
    group.quaternion.copy(parentQuaternion).invert().multiply(cameraQuaternion)

    // apply the background overlay to fit within the block bounds
    const background = backgroundRef.current
    const bounds = text.textRenderInfo?.blockBounds

    if (background && bounds) {
      const [minX, minY, maxX, maxY] = bounds
      const padding = fontSize * BACKGROUND_PADDING

      background.scale.set(maxX - minX + padding * 2, maxY - minY + padding * 2, 1)
      background.position.set((minX + maxX) / 2, (minY + maxY) / 2, 0)
    }
  })

  /**
   * Label press event handler.
   */
  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!isVisible.current) return

    const target = event.target as Element

    event.stopPropagation()
    target?.setPointerCapture?.(event.pointerId)
    pressedAt.current = { x: event.clientX, y: event.clientY }
  }

  /**
   * Label release event handler, which counts as a tap if the pointer barely moved.
   */
  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
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
   * Label hover event handler.
   */
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (!isVisible.current) return

    cancelLeaving()
    event.stopPropagation()
    setHovered(true)
    onPointerOver?.(event)
  }

  /**
   * Label mouseout event handler, which gives the pointer a moment to come back before the label
   * gives up its highlight (see Constants.UI.HOVER_LINGER).
   */
  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh
        ref={backgroundRef}
        material={BACKGROUND_MATERIAL}
        renderOrder={0} // render behind the text
      >
        <planeGeometry args={[1, 1]} />
      </mesh>

      <Text
        ref={ref}
        fontSize={fontSize}
        material={LABEL_MATERIAL}
        renderOrder={1} // render on top of the mesh
        color={color}
        outlineColor={color}
        outlineWidth={hovered ? GLOW.WIDTH : 0}
        outlineBlur={hovered ? GLOW.BLUR : 0}
        outlineOpacity={hovered ? GLOW.OPACITY : 0}
        {...props}
      >
        {children}
      </Text>
    </group>
  )
}

function Label({
  text,
  id,
  color = 'white',
  action,
  targetId,
  parentId,
  isSatellite,
  maxDistance
}: Props) {
  // Keep the view uncluttered: only show a satellite's label when the orbital it orbits is
  // focused (or the satellite itself is focused).
  if (isSatellite && parentId !== targetId && id !== targetId) {
    return null
  }

  return (
    <CameraFacingText
      color={color}
      anchorX="center"
      anchorY="middle"
      fontSize={4}
      font="/static/fonts/MonaspaceArgon-Regular.woff"
      barycenterId={isSatellite ? parentId : undefined}
      maxDistance={maxDistance}
      onClick={() => action.setActiveOrbital(id, text)}
      onPointerOver={() => action.addHighlightedOrbital(id)}
      onPointerOut={() => action.removeHighlightedOrbital(id)}
    >
      {text}
    </CameraFacingText>
  )
}

export default React.memo(Label)
