import './tourLabel.scss'

interface Props {
  /** The CSS BEM modifier controlling the label's visibility. */
  modifier?: string
  /** The text to display. */
  text?: string
}

/**
 * A single line of narration shown during the tour.
 */
export function TourLabel({ modifier, text }: Props) {
  return (
    <div className="tour-label">
      {/* the narration fades in and out for the eye, and is announced as it shows for the ear */}
      <span
        className={`
          tour-label__text
          tour-label__text--${modifier}`}
        aria-hidden="true"
      >
        {text}
      </span>
      <span className="sr-only" role="status">
        {modifier === 'show' ? text : ''}
      </span>
    </div>
  )
}
