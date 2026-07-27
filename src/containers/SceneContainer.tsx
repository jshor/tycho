import React, { useEffect } from 'react'
import TWEEN from 'tween.js'
import { CubeTextureLoader } from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { connect } from 'react-redux'
import Scene from '../components/Scene'
import Constants from '../constants'
import * as AnimationActions from '../actions/AnimationActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import * as LabelActions from '../actions/LabelActions'
import ReduxService from '../services/ReduxService'
import CameraContainer, { CameraContainerHandle, CameraAction } from './CameraContainer'
import EventContainer from './EventContainer'
import { OrbitalData, OrbitalLabelActions } from '../types'

/** Passed in by whoever renders the container. */
interface OwnProps {
  onAnimate: () => void
  width: number
  height: number
  children?: React.ReactNode
}

/** Supplied by connect. */
interface StateProps {
  orbitalData: OrbitalData[]
  time?: number
  scale?: number
  speed?: number
  volume?: number
  zoom?: number
  targetId?: string
  animateTargetChange?: boolean
  highlightedOrbitals?: string[]
  isAutoOrbitEnabled?: boolean
}

export interface Props extends StateProps, OwnProps {
  action?: CameraAction & OrbitalLabelActions
}

function SkyboxSetup(): null {
  const { scene } = useThree()
  useEffect(() => {
    const loader = new CubeTextureLoader()
    scene.background = loader.load(Constants.WebGL.SKYBOX_TEXTURES)
  }, [scene])
  return null
}

function AnimationTick({ onAnimate }: { onAnimate: () => void }): null {
  useFrame(() => {
    onAnimate()
    TWEEN.update()
  })
  return null
}

interface CanvasContentProps {
  props: Props
  cameraRef: React.RefObject<CameraContainerHandle>
  onAnimate: () => void
}

function CanvasContent({ props, cameraRef, onAnimate }: CanvasContentProps) {
  const {
    orbitalData,
    time,
    scale,
    action,
    targetId,
    animateTargetChange,
    highlightedOrbitals,
    zoom,
    volume,
    isAutoOrbitEnabled,
    speed,
    width,
    height,
    children
  } = props

  return (
    <>
      <SkyboxSetup />
      <AnimationTick onAnimate={onAnimate} />
      <CameraContainer
        ref={cameraRef}
        ratio={width / height}
        targetId={targetId}
        animateTargetChange={animateTargetChange}
        action={action}
        speed={speed}
        scale={scale}
        zoom={zoom}
        volume={volume}
        isAutoOrbitEnabled={isAutoOrbitEnabled}
        orbitalData={orbitalData}
      />
      <Scene
        time={time}
        orbitalData={orbitalData}
        scale={scale}
        action={action}
        targetId={targetId}
        highlightedOrbitals={highlightedOrbitals}
      >
        {children}
      </Scene>
    </>
  )
}

export class SceneContainer extends React.Component<Props> {
  cameraRef = React.createRef<CameraContainerHandle>()

  onAnimate = () => {
    this.props.onAnimate()
  }

  changeZoom: React.WheelEventHandler<HTMLDivElement> = (ev) => {
    this.cameraRef.current?.controls?.wheelZoom(ev, this.props.action.changeZoom)
  }

  render() {
    const { width, height } = this.props

    return (
      <EventContainer onWheel={this.changeZoom}>
        <Canvas style={{ width, height }} gl={{ antialias: true, alpha: true }}>
          <CanvasContent props={this.props} cameraRef={this.cameraRef} onAnimate={this.onAnimate} />
        </Canvas>
      </EventContainer>
    )
  }
}

export default connect(
  ReduxService.mapStateToProps<StateProps>(
    'uiControls.zoom',
    'uiControls.scale',
    'uiControls.speed',
    'uiControls.volume',
    'label.targetId',
    'label.animateTargetChange',
    'label.highlightedOrbitals',
    'tour.isAutoOrbitEnabled',
    'animation.time',
    'data.orbitalData'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(
    UIControlsActions,
    AnimationActions,
    LabelActions
  )
)(SceneContainer)
