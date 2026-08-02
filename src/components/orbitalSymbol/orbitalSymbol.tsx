import './orbitalSymbol.scss'

interface Props {
  /** The hex codepoints of the body's sign, as the orbital data carries them. */
  symbol?: string
}

/** What the codepoints of a sign are written apart by in the data. */
const SEPARATOR = '-'

/**
 * Returns the characters the given codepoints spell out.
 */
export const getSymbolText = (symbol?: string): string => {
  if (!symbol) return ''

  return symbol
    .split(SEPARATOR)
    .map((codepoint) => String.fromCodePoint(parseInt(codepoint, 16)))
    .join('')
}

/**
 * The astronomical sign of a body, drawn in the font that carries the signs.
 */
export function OrbitalSymbol({ symbol }: Props) {
  const text = getSymbolText(symbol)

  if (!text) return null

  return (
    <span className="orbital-symbol" aria-hidden="true">
      {text}
    </span>
  )
}
