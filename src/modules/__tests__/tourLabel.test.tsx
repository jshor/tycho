import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import TourLabel from '../tourLabel'

vi.useFakeTimers()

describe('Tour Label Module', () => {
  /** Advances timers inside `act()` so the label's scheduled state changes are flushed. */
  const advanceTimers = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

  const getModifier = (container: HTMLElement) => {
    return container.querySelector('.tour-label span')?.className.trim().split(/\s+/).pop()
  }

  it('should hide the label until its start time', () => {
    const { container } = renderWithStore(<TourLabel text="Hello" start={100} end={5000} />)

    expect(getModifier(container)).toEqual('tour-label__text--hide')
  })

  it('should show the label between its start and end times', () => {
    const { container } = renderWithStore(<TourLabel text="Hello" start={100} end={5000} />)

    advanceTimers(100)

    expect(getModifier(container)).toEqual('tour-label__text--show')
  })

  it('should hide the label again once its end time passes', () => {
    const { container } = renderWithStore(<TourLabel text="Hello" start={100} end={5000} />)

    advanceTimers(5000)

    expect(getModifier(container)).toEqual('tour-label__text--hide')
  })

  it('should not update once unmounted', () => {
    const { unmount } = renderWithStore(<TourLabel text="Hello" start={100} end={5000} />)

    unmount()

    expect(() => vi.advanceTimersByTime(10000)).not.toThrow()
  })
})
