import './labels.scss'

/** An orbital whose label the canvas may draw. */
export interface LabelItem {
  /** The ID of the orbital. */
  id: string
  /** The name the label reads out. */
  name: string
}

interface Props {
  /**
   * The **ordered** orbitals whose labels the canvas draws.
   */
  items: LabelItem[]
  /** Reference for the HTML label of the orbital having the given ID. */
  itemRef?: (id: string, element: HTMLLIElement | null) => void
  /** Click/activation callback handler. */
  onActivate?: (id: string) => void
  /** Label focus callback handler. */
  onFocus?: (id: string) => void
  /** Label blur callback handler. */
  onBlur?: (id: string) => void
}

/**
 * Hidden labels belonging to the orbitals for screen readers/keyboard focus.
 *
 * Note that the visible labels are drawn on the canvas.
 */
export function Labels({ items, itemRef, onActivate, onFocus, onBlur }: Props) {
  return (
    <nav className="labels" aria-label="Orbitals">
      <ul className="labels__list">
        {items.map(({ id, name }) => (
          // hidden until the canvas draws the label, from when its placement is kept by the frame loop
          <li key={id} className="labels__item" ref={(element) => itemRef?.(id, element)} hidden>
            <button
              type="button"
              className="labels__button"
              data-orbital-id={id}
              onClick={() => onActivate?.(id)}
              onFocus={() => onFocus?.(id)}
              onBlur={() => onBlur?.(id)}
            >
              <span className="sr-only">{name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
