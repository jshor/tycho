import { useEffect, useRef } from 'react'
import cx from 'classnames'
import { PageText } from '../../types'
import './splashScreen.scss'

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
export function SplashScreen({ show, pageText, percent, enterScene }: Props) {
  const enterRef = useRef<HTMLButtonElement>(null)
  const isLoaded = percent === 100

  /**
   * Hands the focus to the enter button once it takes the loading bar's place.
   */
  useEffect(() => {
    if (isLoaded && show) {
      enterRef.current?.focus({ preventScroll: true })
    }
  }, [isLoaded, show])

  /**
   * Renders the button that enters the scene.
   */
  const renderEnterButton = () => {
    return (
      <div className="splash-screen__button">
        <button
          ref={enterRef}
          type="button"
          className="splash-screen__button-anchor"
          onClick={enterScene}
        >
          {pageText && pageText.start}
        </button>
      </div>
    )
  }

  /**
   * Renders the bar tracking how much of the scene has loaded.
   */
  const renderLoadingBar = () => {
    return (
      <div
        className="splash-screen__loading"
        role="progressbar"
        aria-label="Loading"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent ?? 0)}
      >
        <div className="splash-screen__loading-bar" style={{ width: `${percent}%` }}></div>
      </div>
    )
  }

  /**
   * Renders the enter button once loading completes, and the loading bar until then.
   */
  const renderUserPrompt = () => {
    if (isLoaded) {
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
      inert={!show}
    >
      <div className="splash-screen__hero" aria-hidden="true"></div>
      <div className="splash-screen__content">{renderUserPrompt()}</div>
    </div>
  )
}
