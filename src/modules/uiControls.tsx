import useStore from '../store'
import UIControlsView from '../components/uiControls'

/**
 * Connects the heads-up display to the store.
 */
export default function UIControls() {
  const zoom = useStore((state) => state.zoom)
  const controlsEnabled = useStore((state) => state.controlsEnabled)
  const targetName = useStore((state) => state.targetName)
  const changeZoom = useStore((state) => state.changeZoom)

  /**
   * Opens the modal of the given type, yielding interactivity to it.
   */
  const openModal = (activeModal: string) => {
    useStore.setState({ activeModal, controlsEnabled: false })
  }

  return (
    <UIControlsView
      controlsEnabled={controlsEnabled}
      targetName={targetName}
      zoom={zoom}
      openModal={openModal}
      changeZoom={changeZoom}
    />
  )
}
