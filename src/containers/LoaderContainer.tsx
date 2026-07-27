import { useCallback, useEffect, useState } from 'react'
import { DefaultLoadingManager } from 'three'
import { connect } from 'react-redux'
import * as AnimationActions from '../actions/AnimationActions'
import * as LoaderActions from '../actions/LoaderActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import SplashScreen from '../components/SplashScreen'
import { PageText, BoundActions } from '../types'

export interface Props {
  /** The url of the asset that most recently finished loading. */
  url?: string
  /** How much of the scene has loaded, from 0 to 100. */
  percent?: number
  /** Whether the simulation is currently playing. */
  playing?: boolean
  /** The translated page text for the app. */
  pageText?: PageText
  /** Store actions. */
  action?: Pick<BoundActions, 'setPercentLoaded' | 'setTextureLoaded' | 'setPlaying' | 'setVolume'>
}

/**
 * Holds the splash screen in front of the scene until its assets have loaded.
 */
export function LoaderContainer({ percent, pageText, action }: Props) {
  const [hasEntered, setHasEntered] = useState(false)

  /** Records each asset THREE.js finishes loading. */
  const onProgress = useCallback(
    (url: string, count: number, total: number) => {
      action.setPercentLoaded(count, total)
      action.setTextureLoaded(url)
    },
    [action]
  )

  /** Updates the loading progress to the store. */
  useEffect(() => {
    DefaultLoadingManager.onProgress = onProgress
  }, [onProgress])

  /** Dismisses the splash screen to start the simulation. */
  const enterScene = () => {
    action.setPlaying(true)
    action.setVolume(1)
    setHasEntered(true)
  }

  return (
    <SplashScreen
      percent={percent || 0}
      show={!hasEntered}
      enterScene={enterScene}
      pageText={pageText}
    />
  )
}

export default connect(
  ReduxService.mapStateToProps<Props>(
    'loader.url',
    'loader.percent',
    'animation.playing',
    'data.pageText'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(
    AnimationActions,
    LoaderActions,
    UIControlsActions
  )
)(LoaderContainer)
