import cx from 'classnames'
import Settings from '../settings'
import ZoomSlider from '../slider/zoomSlider'
import DatePicker from '../../modules/datePicker'
import PlayPause from '../../modules/playPause'
import Volume from '../../modules/volume'
import Constants from '../../constants'
import { PageText } from '../../types'

interface Props {
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** Whether or not the settings panel is expanded. */
  settingsActive?: boolean
  /** The name of the orbital the camera is focused on. */
  targetName?: string
  /** The current zoom level. */
  zoom?: number
  /** The speed at which time passes in the simulation. */
  speed?: number
  /** The scale applied to the size of each body. */
  scale?: number
  /** Opens the modal of the given type. */
  openModal?: (type: string) => void
  /** Applies a new zoom level. */
  changeZoom?: (zoom: number) => void
  /** Applies a new simulation speed. */
  changeSpeed?: (speed: number) => void
  /** Applies a new body scale. */
  changeScale?: (scale: number) => void
  /** Expands and collapses the settings panel. */
  toggleSetting?: () => void
  /** The translated page text for the app. */
  pageText?: PageText
}

/**
 * The heads-up display overlaying the scene.
 */
export default function UIControls({
  controlsEnabled,
  settingsActive,
  targetName,
  zoom,
  speed,
  scale,
  openModal,
  changeZoom,
  changeSpeed,
  changeScale,
  toggleSetting,
  pageText
}: Props) {
  return (
    <div
      className={cx({
        uicontrols: true,
        'uicontrols--enabled': controlsEnabled,
        'uicontrols--disabled': !controlsEnabled
      })}
    >
      <div className="uicontrols__control uicontrols__control--scales">
        <Settings
          settingsActive={settingsActive}
          speed={speed}
          scale={scale}
          pageText={pageText}
          toggleSetting={toggleSetting}
          changeSpeed={changeSpeed}
          changeScale={changeScale}
        />
      </div>

      <div className="uicontrols__control uicontrols__control--target-label">
        <span
          className="uicontrols__control uicontrols__control--stats-modal"
          onClick={openModal && (() => openModal(Constants.UI.ModalTypes.STATS_MODAL))}
        >
          {targetName}
        </span>
      </div>

      <div className="uicontrols__control uicontrols__control--datetime">
        <DatePicker />
        <PlayPause />
      </div>

      <div className="uicontrols__control uicontrols__control--left-bar">
        <div
          className="uicontrols__button uicontrols__button--about-modal"
          onClick={openModal && (() => openModal(Constants.UI.ModalTypes.ABOUT_MODAL))}
        ></div>
        <ZoomSlider value={zoom} onChange={changeZoom} />
        <div className="uicontrols__button uicontrols__button--volume">
          <Volume />
        </div>
      </div>
    </div>
  )
}
