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
      <span
        className={`
                    tour-label__text
                    tour-label__text--${modifier}`}
      >
        {text}
      </span>
    </div>
  )
}
