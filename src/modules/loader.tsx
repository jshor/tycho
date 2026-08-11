import { useCallback, useEffect, useState } from 'react'
import { DefaultLoadingManager } from 'three'
import { useStore } from '../store'
import { SplashScreen } from '../components/splashScreen/splashScreen'

/**
 * Holds the splash screen in front of the scene until its assets have loaded.
 */
export function Loader() {
  const percent = useStore((state) => state.percent)
  const pageText = useStore((state) => state.pageText)
  const setPercentLoaded = useStore((state) => state.setPercentLoaded)
  const setActiveOrbitalId = useStore((state) => state.setActiveOrbitalId)
  const [hasEntered, setHasEntered] = useState(false)

  /**
   * Records each asset THREE.js finishes loading.
   */
  const onProgress = useCallback(
    (url: string, count: number, total: number) => {
      setPercentLoaded(count, total)
      useStore.setState({ url })
    },
    [setPercentLoaded]
  )

  /**
   * Updates the loading progress to the store.
   */
  useEffect(() => {
    DefaultLoadingManager.onProgress = onProgress
  }, [onProgress])

  /**
   * Dismisses the splash screen to start the simulation.
   */
  const enterScene = () => {
    useStore.setState({ playing: true, volume: 1 })
    setHasEntered(true)
    setActiveOrbitalId('sun', false)
    setTimeout(() => useStore.setState({ zoom: 100 }))
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
