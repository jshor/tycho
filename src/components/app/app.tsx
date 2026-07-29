import { Markdown } from '../markdown/markdown'
import { Scene } from '../../modules/scene'
import { UIControls } from '../../modules/uiControls'
import { Loader } from '../../modules/loader'
import { Tour } from '../../modules/tour'
import { Modal } from '../../modules/modal'
import { Stats } from '../../modules/stats'
import { Constants } from '../../constants'
import { PageText } from '../../types'

interface Props {
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** The translated page text for the app. */
  pageText: PageText
}

/**
 * The visible application: the scene, its controls, and its modals.
 */
export function App({ onAnimate, pageText }: Props) {
  return (
    <>
      <Scene onAnimate={onAnimate} width={window.innerWidth} height={window.innerHeight} />
      <UIControls />
      <Loader />
      <Tour labels={Constants.Tour.LABELS} />
      <Modal type={Constants.UI.ModalTypes.STATS_MODAL}>
        <Stats />
      </Modal>
      <Modal type={Constants.UI.ModalTypes.ABOUT_MODAL}>
        <Markdown text={pageText.aboutInfo} />
      </Modal>
    </>
  )
}
