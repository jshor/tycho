import cx from 'classnames'
import Settings from '../settings'
import ZoomSlider from '../slider/zoomSlider'
import DatePicker from '../../modules/datePicker'
import PlayPause from '../../modules/playPause'
import Volume from '../../modules/volume'
import Constants from '../../constants'
import { PageText } from '../../types'

interface Props {
  /** Whether the user may interact with the controls. */
  controlsEnabled?: boolean
  /** The name of the orbital the camera is focused on. */
  targetName?: string
  /** The current simulation time. */
  time?: number
  /** The current zoom level. */
  zoom?: number
  /** Opens the modal of the given type. */
  openModal?: (type: string) => void
  /** Moves the simulation to a new point in time. */
  changeTimeOffset?: (offset: number) => void
  /** Applies a new zoom level. */
  changeZoom?: (zoom: number) => void
  /** Expands and collapses the settings panel. */
  toggleSetting?: () => void
  /** The translated page text for the app. */
  pageText?: PageText
  /** Remaining store state and actions, forwarded to the settings panel. */
  [key: string]: unknown
}

/**
 * The heads-up display overlaying the scene.
 */
export default function UIControls(props: Props) {
  const { controlsEnabled, targetName, time, zoom, openModal, changeTimeOffset, changeZoom } = props

  return (
    <div
      className={cx({
        uicontrols: true,
        'uicontrols--enabled': controlsEnabled,
        'uicontrols--disabled': !controlsEnabled
      })}
    >
      <div className="uicontrols__control uicontrols__control--scales">
        <Settings {...props} />
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
        <DatePicker time={time} onUpdate={changeTimeOffset} />
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
