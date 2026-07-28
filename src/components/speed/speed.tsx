interface Props {
  /** The power of ten the simulation clock runs at. */
  speed?: number
  /** Steps the simulation up to its next speed. */
  onClick?: () => void
}

/**
 * The button that steps the simulation through its speeds, shown as a power of ten.
 */
export function Speed({ speed = 0, onClick }: Props) {
  return (
    <div className="speed" onClick={onClick}>
      <span className="speed__button">
        10<sup className="speed__exponent">{speed}</sup>
      </span>
    </div>
  )
}
