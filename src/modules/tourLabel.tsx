import { useEffect, useState } from 'react'
import TourLabelView from '../components/tourLabel'

interface Props {
  /** The text to display. */
  text?: string
  /** Duration after the tour begins the label appears, in ms. */
  start?: number
  /** Duration after the tour begins the label disappears, in ms. */
  end?: number
}

/**
 * Shows a single tour label for the window of time it belongs to.
 */
export default function TourLabel({ text, start, end }: Props) {
  const [modifier, setModifier] = useState('hide')

  /** Reveals the label at its start time and hides it again at its end time. */
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setModifier('show'), start),
      setTimeout(() => setModifier('hide'), end)
    ]

    return () => timeouts.forEach(clearTimeout)
  }, [start, end])

  return <TourLabelView modifier={modifier} text={text} />
}
