import { useThree, useFrame, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useRef, useState, useMemo, useEffect } from 'react'
import { Constants } from '../../../constants'
import { clink } from '../../../elements/sound'
import { labelPlacements } from '../../../utils/labels'
import { countBodies, getOccludingBodies, OccludingBody } from '../../../utils/sun'
import { Scale } from '../../../utils/scale'
import { useStore } from '../../../store'

interface TroikaText extends THREE.Mesh {
  textRenderInfo?: {
    /** [minX, minY, maxX, maxY] of the laid-out block, in the text's local units. */
    blockBounds: [number, number, number, number]
  }
}

interface Props {
  /** The ID of the orbital. */
  id?: string
  /** Whether or not the button is keyboard focused. */
  focused?: boolean
  /** Children elements to be rendered inside the text. */
  children?: React.ReactNode
  /** The visual circle that pinpoints the orbital body. */
  marker?: (hovered: boolean) => React.ReactNode
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
  onPointerOver?: () => void
  /** Pointer out callback event. */
  onPointerOut?: () => void
  /** Color of the text. */
  color?: THREE.ColorRepresentation
  /** Path to the font file for the text. */
  font?: string
}

interface Placed {
  /** The group containing the label's draw order. */
  group: THREE.Group
  /** The plane the label is drawn on. */
  background: THREE.Mesh
}

/** The set of all labels placed in the scene. */
const placed = new Set<Placed>()

/** The corners of the unit plane a label is drawn on, in its own local units. */
const PLANE_CORNERS: [number, number][] = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [-0.5, 0.5]
]

/**
 * A WebGL text element that always faces the camera.
 */
export function CameraText({
  id,
  focused,
  children,
  marker,
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
  const textRef = useRef<THREE.Group>(null)
  const backgroundRef = useRef<THREE.Mesh>(null)
  const { camera, scene, size, raycaster, pointer } = useThree()
  const orbitalData = useStore((state) => state.orbitalData)
  const bodiesRef = useRef<OccludingBody[]>([])
  const isVisible = useRef(true)
  const pressedAt = useRef<{ x: number; y: number } | null>(null)
  const leaving = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Whether the pointer is on the label, as of the last frame it was placed on screen. */
  const isHovered = useRef(false)

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
  const corner = useMemo(() => new THREE.Vector3(), [])
  const toLabel = useMemo(() => new THREE.Vector3(), [])
  const toBody = useMemo(() => new THREE.Vector3(), [])

  /** Whether the label is drawn as if hovered, which a keyboard focus does just as a pointer. */
  const isRaised = hovered || !!focused

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
   * Lets go of the label, wherever the pointer has got to.
   */
  const releaseHover = (): void => {
    cancelLeaving()

    if (!isHovered.current) return

    isHovered.current = false
    setHovered(false)
    onPointerOut?.()
  }

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

    if (!withinRange) {
      // nothing is left on screen for the pointer or for a DOM button
      releaseHover()
      hidePlacement()
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
   * Hangs the text off the top right corner of the marker, which holds the body's own center.
   */
  const placeText = (text: TroikaText): void => {
    const group = textRef.current
    const bounds = text.textRenderInfo?.blockBounds

    if (!group || !bounds) return

    const [minX, minY] = bounds
    const { GAP, RADIUS } = Constants.WebGL.Marker
    const clearance = RADIUS + GAP

    // the block's own bottom left corner is brought out to the marker's top right
    group.position.set(clearance - minX, clearance - minY, 0)
  }

  /**
   * Returns true if the pointer is on another label drawn over this one.
   */
  const isCovered = (group: THREE.Group): boolean => {
    for (const other of placed) {
      if (
        other.group !== group &&
        other.group.visible &&
        other.group.renderOrder > group.renderOrder &&
        raycaster.intersectObject(other.background, false).length
      ) {
        return true
      }
    }
    return false
  }

  /**
   * Highlights the label when hovered.
   */
  const applyPointerHoverState = (group: THREE.Group): void => {
    const background = backgroundRef.current

    if (!background) return

    // the plane was moved, turned and re-fitted above, and is raycast where it now sits
    background.updateWorldMatrix(true, false)
    raycaster.setFromCamera(pointer, camera)

    if (!raycaster.intersectObject(background, false).length || isCovered(group)) {
      if (isHovered.current && leaving.current === null) {
        leaving.current = setTimeout(releaseHover)
      }
      return
    }

    cancelLeaving()

    if (isHovered.current) return

    isHovered.current = true
    setHovered(true)
    onPointerOver?.()
  }

  /**
   * Records that the label is drawn nowhere on screen.
   */
  const hidePlacement = (): void => {
    if (id && labelPlacements.has(id)) {
      labelPlacements.set(id, { ...labelPlacements.get(id), visible: false })
    }
  }

  /**
   * Returns the bodies that may stand between the camera and the label.
   */
  const getBodies = (): OccludingBody[] => {
    if (bodiesRef.current.length < countBodies(orbitalData)) {
      bodiesRef.current = getOccludingBodies(scene, orbitalData)
    }

    return bodiesRef.current
  }

  /**
   * Returns true if a body stands between the camera and the point the label hangs from, which
   * hides the label from view, as the depth test draws it.
   */
  const isOccluded = (): boolean => {
    toLabel.subVectors(textPosition, cameraPosition)

    const reach = toLabel.length()

    toLabel.divideScalar(reach || 1)

    return getBodies().some(({ object, radius }) => {
      object.getWorldPosition(toBody).sub(cameraPosition)

      // how far along the line of sight the body sits, which must be short of the label
      const along = toBody.dot(toLabel)

      return along > 0 && along < reach && toBody.lengthSq() - along * along < Scale(radius) ** 2
    })
  }

  /**
   * Records where on screen the label's background was drawn. Its DOM button is placed there.
   */
  const recordPlacement = (text: TroikaText, order: number): void => {
    const background = backgroundRef.current

    if (!id || !background) return

    if (!text.textRenderInfo) {
      // the text is not laid out yet so nothing is drawn
      return hidePlacement()
    }

    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity]
    let isInFront = true

    for (const [x, y] of PLANE_CORNERS) {
      corner.set(x, y, 0).applyMatrix4(background.matrixWorld).project(camera)

      // a corner past the far side of the frustum is one behind the camera
      isInFront &&= corner.z <= 1

      const screenX = ((corner.x + 1) / 2) * size.width
      const screenY = ((1 - corner.y) / 2) * size.height

      left = Math.min(left, screenX)
      top = Math.min(top, screenY)
      right = Math.max(right, screenX)
      bottom = Math.max(bottom, screenY)
    }

    const isOnScreen = right > 0 && bottom > 0 && left < size.width && top < size.height

    labelPlacements.set(id, {
      visible: isInFront && isOnScreen && !isOccluded(),
      left,
      top,
      width: right - left,
      height: bottom - top,
      order
    })
  }

  /**
   * Updates the label's position, scale, and orientation each frame.
   */
  useFrame(() => {
    const text = ref.current
    const group = groupRef.current
    const parent = group?.parent

    if (!text || !group || !parent) return

    camera.matrixWorld.decompose(cameraPosition, cameraQuaternion, cameraScale)

    if (!applyRangeHoverState(group)) return

    readBodyTransformations(parent)
    offsetFromOrbital(group)

    const distance = cameraPosition.distanceTo(textPosition)
    // the hovered (or focused) label is drawn after all the rest, so that none of it is hidden
    const order =
      isHovered.current || focused
        ? Constants.WebGL.LABEL_RENDER_ORDER
        : Constants.WebGL.LABEL_RENDER_ORDER - distance

    group.renderOrder = order

    if (textRef.current) textRef.current.renderOrder = order

    scaleLabelToScreen(group, distance)
    faceCamera(group)
    applyBackgroundPlane(text)
    placeText(text)
    applyPointerHoverState(group)
    recordPlacement(text, order)
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

  // a label that goes away mid-departure would otherwise leave the timer to fire into nothing
  useEffect(() => cancelLeaving, [])

  // forget where the label was drawn once it goes away
  useEffect(() => {
    if (!id) return

    return () => {
      labelPlacements.delete(id)
    }
  }, [id])

  useEffect(() => {
    const group = groupRef.current
    const background = backgroundRef.current

    if (!group || !background) return

    const entry = { group, background }

    placed.add(entry)

    return () => {
      placed.delete(entry)
    }
  }, [])

  /**
   * Plays a "clink" sound when the pointer hovers over the label.
   */
  useEffect(() => {
    if (hovered) {
      clink.play(1)
    }
  }, [hovered])

  return (
    <group ref={groupRef} onPointerDown={onPress} onPointerUp={onRelease}>
      {/* the marker keeps the group's own origin, which sits on the body itself */}
      {marker?.(isRaised)}

      <group ref={textRef}>
        <mesh ref={backgroundRef} material={Constants.WebGL.LABEL_BACKGROUND_MATERIAL}>
          <planeGeometry args={[1, 1]} />
        </mesh>

        <Text
          ref={ref}
          fontSize={fontSize}
          material={Constants.WebGL.LABEL_MATERIAL}
          renderOrder={1} // render on top of the mesh
          color={color}
          outlineColor={color}
          outlineWidth={isRaised ? Constants.WebGL.LABEL_GLOW.WIDTH : 0}
          outlineBlur={isRaised ? Constants.WebGL.LABEL_GLOW.BLUR : 0}
          outlineOpacity={isRaised ? Constants.WebGL.LABEL_GLOW.OPACITY : 0}
          {...props}
        >
          {children}
        </Text>
      </group>
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
