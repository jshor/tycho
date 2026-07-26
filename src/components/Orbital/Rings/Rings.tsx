import React from 'react'
import { DoubleSide, Euler } from 'three'
import Scale from '../../../utils/Scale'
import MathService from '../../../services/MathService'
import TextureContainer from '../../../containers/TextureContainer'
import { TextureMap } from '../../../types'

interface Props {
  outerRadius: number
  maps: TextureMap[]
  barycenterTilt: number
  scale?: number
}

export default class Rings extends React.Component<Props> {
  render() {
    const { outerRadius, scale, maps } = this.props
    const tilt = MathService.toRadians(this.props.barycenterTilt)
    const size = Scale(outerRadius * 2, scale)
    const rotation = new Euler(tilt, 0, 0)

    return (
      <mesh rotation={rotation}>
        <planeGeometry args={[size, size]} />
        <TextureContainer transparent={true} side={DoubleSide} textures={maps} />
      </mesh>
    )
  }
}
