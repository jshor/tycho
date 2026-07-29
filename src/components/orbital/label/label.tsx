import React from 'react'
import * as THREE from 'three'
import { Constants } from '../../../constants'
import { CameraText } from './cameraText'
import { Scale, getVisibleRadius } from '../../../utils/Scale'
import { OrbitalLabelActions } from '../../../types'

interface Props {
  /** The text to display in the label. */
  text: string
  /** The unique identifier for the label. */
  id: string
  /** The color of the label's text, which the orbital wears elsewhere in the scene too. */
  color?: THREE.ColorRepresentation
  /** The radius of the orbital the label names, in km. */
  radius?: number
  /** The action associated with the label. */
  action: OrbitalLabelActions
  /** The orbital at the centre of the system the camera is watching. */
  systemId?: string
  /** Whether or not the camera is focused on this orbital itself. */
  isFocused?: boolean
  /** The parent identifier for the label. */
  parentId?: string
  /** Whether the label is for a satellite. */
  isSatellite?: boolean
  /** The identifier for the barycenter of the label. */
  maxDistance?: number
}

/**
 * The label to display for an orbital.
 */
export const Label = React.memo(
  ({
    text,
    id,
    color = 'white',
    radius = 0,
    action,
    systemId,
    isFocused,
    parentId,
    isSatellite,
    maxDistance
  }: Props) => {
    if (isFocused) {
      // don't show the label when the orbital is focused
      return null
    }

    if (isSatellite && parentId !== systemId) {
      // don't show the label for satellites whose barycenter isn't focused
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
        onClick={() => action.setActiveOrbital(id, text)}
        onPointerOver={() => action.addHighlightedOrbital(id)}
        onPointerOut={() => action.removeHighlightedOrbital(id)}
      >
        {text}
      </CameraText>
    )
  }
)

Label.displayName = 'Label'
