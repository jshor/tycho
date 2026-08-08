import React from 'react'
import * as THREE from 'three'
import { Constants } from '../../../constants'
import { CameraText } from './cameraText'
import { Scale, getVisibleRadius } from '../../../utils/Scale'

interface Props {
  /** The text to display in the label. */
  text: string
  /** The color of the label's text, which the orbital wears elsewhere in the scene too. */
  color?: THREE.ColorRepresentation
  /** The radius of the orbital the label names, in km. */
  radius?: number
  /** Whether or not the camera is focused on this orbital itself. */
  isFocused?: boolean
  /** The parent identifier for the label. */
  parentId?: string
  /** Whether the label is for a satellite. */
  isSatellite?: boolean
  /** The identifier for the barycenter of the label. */
  maxDistance?: number
  /** Callback function when the label is hovered. */
  onHover?: () => void
  /** Callback function when the label is no longer hovered. */
  onLeave?: () => void
  /** Callback function when the label is focused. */
  onFocus?: () => void
}

/**
 * The label to display for an orbital.
 */
export const Label = React.memo(
  ({
    text,
    color = 'white',
    radius = 0,
    isFocused,
    parentId,
    isSatellite,
    maxDistance,
    onHover,
    onLeave,
    onFocus
  }: Props) => {
    if (isFocused) {
      // don't show the label when the orbital is focused
      return null
    }

    return (
      <CameraText
        color={color}
        fontSize={Constants.WebGL.LABEL_FONT_SIZE}
        font={Constants.WebGL.LABEL_FONT_PATH}
        barycenterId={isSatellite ? parentId : undefined}
        maxDistance={maxDistance}
        standoff={Scale(getVisibleRadius(radius)) * Constants.WebGL.LABEL_STANDOFF}
        onClick={() => onFocus?.()}
        onPointerOver={() => onHover?.()}
        onPointerOut={() => onLeave?.()}
      >
        {text}
      </CameraText>
    )
  }
)

Label.displayName = 'Label'
