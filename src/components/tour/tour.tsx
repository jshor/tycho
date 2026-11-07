import React, { useEffect, useRef } from 'react'
import { SpinLabel } from '../../modules/spinLabel'
import cx from 'classnames'
import { PageText } from '../../types'
import './tour.scss'

interface Props {
  /** Whether the tour has finished playing. */
  isComplete?: boolean
  /** The narration labels that play over the course of the tour. */
  labels?: React.ReactNode[]
  /** Ends the tour early. */
  skipTour?: () => void
  /** The translated page text for the app. */
  pageText?: PageText
}

/**
 * The letterboxed narration that plays over the scene when the app first loads.
 */
export function Tour({ isComplete, labels, skipTour, pageText }: Props) {
  const skipRef = useRef<HTMLButtonElement>(null)

  /**
   * Focuses the skip button as the tour starts.
   */
  useEffect(() => {
    if (!isComplete) {
      skipRef.current?.focus({ preventScroll: true })
    }
  }, [isComplete])

  return (
    <div>
      <div
        inert={isComplete}
        className={cx({
          tour: true,
          'tour--hide': isComplete,
          'tour--show': !isComplete
        })}
      >
        <div
          className={cx({
            'tour__theater-bar': true,
            'tour__theater-bar--hide': isComplete,
            'tour__theater-bar--show': !isComplete
          })}
          style={{ top: 0 }}
        ></div>
        <div className="tour__labels">{labels}</div>
        <div
          className={cx({
            'tour__theater-bar': true,
            'tour__theater-bar--hide': isComplete,
            'tour__theater-bar--show': !isComplete
          })}
          style={{ bottom: 0 }}
        >
          <button ref={skipRef} type="button" className="tour__skip-link" onClick={skipTour}>
            {pageText && pageText.skipTour}
          </button>
        </div>
      </div>
      <SpinLabel />
    </div>
  )
}
