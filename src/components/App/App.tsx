import Markdown from '../Markdown'
import SceneContainer from '../../containers/SceneContainer'
import UIControlsContainer from '../../containers/UIControlsContainer'
import LoaderContainer from '../../containers/LoaderContainer'
import TourContainer from '../../containers/TourContainer'
import ModalContainer from '../../containers/ModalContainer'
import StatsContainer from '../../containers/StatsContainer'
import Constants from '../../constants'
import { PageText } from '../../types'

interface Props {
  /** Invoked on every animation frame of the scene. */
  onAnimate: () => void
  /** The active orbital target name, used as the stats modal title. */
  title?: string
  /** The translated page text for the app. */
  pageText: PageText
}

/**
 * The visible application: the scene, its controls, and its modals.
 */
export default function App({ onAnimate, title, pageText }: Props) {
  return (
    <div>
      <SceneContainer onAnimate={onAnimate} width={window.innerWidth} height={window.innerHeight} />
      <UIControlsContainer />
      <LoaderContainer />
      <TourContainer labels={Constants.Tour.LABELS} />
      <ModalContainer type={Constants.UI.ModalTypes.STATS_MODAL} title={title}>
        <StatsContainer />
      </ModalContainer>
      <ModalContainer type={Constants.UI.ModalTypes.ABOUT_MODAL} title={pageText.aboutTitle}>
        <Markdown text={pageText.aboutInfo} />
      </ModalContainer>
    </div>
  )
}
