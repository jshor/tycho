import useStore from '../store'
import UIControlsView from '../components/uiControls'

/**
 * Connects the heads-up display to the store.
 */
export default function UIControls() {
  const speed = useStore((state) => state.speed)
  const zoom = useStore((state) => state.zoom)
  const scale = useStore((state) => state.scale)
  const controlsEnabled = useStore((state) => state.controlsEnabled)
  const settingsActive = useStore((state) => state.settingsActive)
  const targetName = useStore((state) => state.targetName)
  const pageText = useStore((state) => state.pageText)
  const changeZoom = useStore((state) => state.changeZoom)
  const changeSpeed = useStore((state) => state.changeSpeed)
  const changeScale = useStore((state) => state.changeScale)

  /** Expands the settings panel when it is collapsed, and collapses it when expanded. */
  const toggleSetting = () => {
    useStore.setState({ settingsActive: !settingsActive })
  }

  /** Opens the modal of the given type, yielding interactivity to it. */
  const openModal = (activeModal: string) => {
    useStore.setState({ activeModal, controlsEnabled: false })
  }

  return (
    <UIControlsView
      controlsEnabled={controlsEnabled}
      settingsActive={settingsActive}
      targetName={targetName}
      pageText={pageText}
      speed={speed}
      zoom={zoom}
      scale={scale}
      openModal={openModal}
      toggleSetting={toggleSetting}
      changeZoom={changeZoom}
      changeSpeed={changeSpeed}
      changeScale={changeScale}
    />
  )
}
