import React from 'react'
import * as THREE from 'three'
import Constants from '../../../constants'
import Scale, { getVisibleRadius } from '../../../utils/Scale'
import TextureContainer from '../../../containers/TextureContainer'
import Rings from '../../Orbital/Rings'
import { TextureMap, RingData } from '../../../types'

interface Props {
  radius: number
  rotation?: THREE.Euler
  rings?: RingData
  maps?: TextureMap[]
  scale?: number
}

export default class Body extends React.Component<Props> {
  render() {
    const { rings, radius, scale } = this.props

    return (
      <group>
        <mesh rotation={this.props.rotation}>
          <sphereGeometry
            args={[
              Scale(getVisibleRadius(radius), scale),
              Constants.WebGL.SPHERE_SEGMENTS,
              Constants.WebGL.SPHERE_SEGMENTS
            ]}
          />
          <TextureContainer textures={this.props.maps} />
        </mesh>
        {rings && <Rings {...rings} scale={scale} />}
      </group>
    )
  }
}
