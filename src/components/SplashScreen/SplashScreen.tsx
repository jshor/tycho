import cx from 'classnames'
import { PageText } from '../../types'

interface Props {
  /** Whether or not the splash screen should be visible. */
  show?: boolean
  /** The translated page text for the app. */
  pageText?: PageText
  /** How much of the scene has loaded [0, 100]. */
  percent?: number
  /** Dismisses the splash screen to enter the scene. */
  enterScene?: () => void
}

/**
 * The loading screen shown until the scene is ready to enter.
 */
export default function SplashScreen({ show, pageText, percent, enterScene }: Props) {
  /** Renders the anchor that enters the scene. */
  const renderEnterButton = () => {
    return (
      <div className="splash-screen__button">
        <a className="splash-screen__button-anchor" onClick={enterScene}>
          {pageText && pageText.start}
        </a>
      </div>
    )
  }

  /** Renders the bar tracking how much of the scene has loaded. */
  const renderLoadingBar = () => {
    return (
      <div className="splash-screen__loading">
        <div className="splash-screen__loading-bar" style={{ width: `${percent}%` }}></div>
      </div>
    )
  }

  /** Renders the enter button once loading completes, and the loading bar until then. */
  const renderUserPrompt = () => {
    if (percent === 100) {
      return renderEnterButton()
    }
    return renderLoadingBar()
  }

  return (
    <div
      className={cx({
        'splash-screen': true,
        'splash-screen--hide': !show,
        'splash-screen--show': show
      })}
    >
      <div className="splash-screen__hero"></div>
      <div className="splash-screen__content">{renderUserPrompt()}</div>
    </div>
  )
}
