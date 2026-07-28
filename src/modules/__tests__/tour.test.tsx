import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import { Tour } from '../tour'
import { Constants } from '../../constants'
import { Store } from '../../types'

vi.useFakeTimers()

const labels = [
  { duration: 5000, text: 'Welcome to the Solar System' },
  { duration: 5000, text: 'This is a real-time interactive simulation' },
  { duration: 3000, text: "Let's start exploring" }
]

/** The value the tour compares `tourViewed` against when deciding to skip itself. */
const TOUR_VIEWED_SKIP_VALUE = 'true_TEST'

/** One separation interval leads each label, plus one before the first. */
const TOUR_DURATION = labels.reduce(
  (total, { duration }) => total + duration + Constants.Tour.SEPARATION_INTERVAL,
  Constants.Tour.SEPARATION_INTERVAL
)

/**
 * Advances timers inside `act()` so the labels' scheduled state changes are flushed.
 */
const advanceTimers = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Tour Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<Tour labels={labels} />, { pageText: {}, ...state })
  }

  describe('render()', () => {
    it('should render nothing while the scene is not playing', () => {
      const { container } = renderModule({ playing: false })

      expect(container.firstChild).toBeNull()
    })

    it('should render the tour once the scene is playing', () => {
      const { container } = renderModule({ playing: true })

      expect(container.querySelector('.tour')).not.toBeNull()
    })
  })

  describe('initialize()', () => {
    it('should start the tour on the first visit', () => {
      renderModule({ playing: true })
      advanceTimers(0)

      const { isAutoOrbitEnabled, controlsEnabled, isComplete } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(true)
      expect(controlsEnabled).toBe(false)
      expect(isComplete).toBeUndefined()
    })

    it('should skip the tour when it was already viewed', () => {
      localStorage.setItem('tourViewed', TOUR_VIEWED_SKIP_VALUE)

      renderModule({ playing: true })
      advanceTimers(TOUR_DURATION)

      const { isComplete, isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isComplete).toBe(true)
      expect(isAutoOrbitEnabled).toBe(false)
      expect(controlsEnabled).toBe(true)
    })

    it('should not start the tour until the scene is playing', () => {
      renderModule({ playing: false })
      advanceTimers(0)

      expect(useStore.getState().isAutoOrbitEnabled).toBeUndefined()

      act(() => useStore.setState({ playing: true }))
      advanceTimers(0)

      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
    })

    it('should only initialize once, no matter how many times it renders', () => {
      renderModule({ playing: true })
      advanceTimers(0)

      // the user has since taken the camera back; re-rendering must not start the tour again
      act(() => useStore.setState({ isAutoOrbitEnabled: false }))
      advanceTimers(0)

      expect(useStore.getState().isAutoOrbitEnabled).toBe(false)
    })
  })

  describe('initializeTour()', () => {
    it('should complete the tour once every label has played', () => {
      renderModule({ playing: true })

      advanceTimers(TOUR_DURATION - 1)

      expect(useStore.getState().isComplete).toBeUndefined()

      advanceTimers(1)

      expect(useStore.getState().isComplete).toBe(true)
      expect(localStorage.getItem('tourViewed')).toEqual('true')
    })
  })

  describe('skipTour()', () => {
    it('should end the tour, restore the UI controls and remember it was viewed', () => {
      const { container } = renderModule({ playing: true })

      fireEvent.click(container.querySelector('.tour__skip-link'))

      const { isComplete, isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isComplete).toBe(true)
      expect(isAutoOrbitEnabled).toBe(false)
      expect(controlsEnabled).toBe(true)
      expect(localStorage.getItem('tourViewed')).toEqual('true')
    })
  })

  describe('getLabels()', () => {
    it('should render a label for each item of narration', () => {
      const { container } = renderModule({ playing: true })

      expect(container.querySelectorAll('.tour-label')).toHaveLength(labels.length)
    })

    it('should play each label in turn, separated by the separation interval', () => {
      const { container } = renderModule({ playing: true })
      const separation = Constants.Tour.SEPARATION_INTERVAL

      /**
       * The label currently on screen, if any.
       */
      const shown = () => {
        const label = container.querySelector('.tour-label__text--show')

        return label ? label.textContent : null
      }

      let elapsed = 0

      labels.forEach(({ text, duration }) => {
        advanceTimers(separation)
        elapsed += separation

        expect(shown()).toEqual(text)

        advanceTimers(duration)
        elapsed += duration

        expect(shown()).toBeNull()
      })

      expect(elapsed).toBeLessThan(TOUR_DURATION)
    })
  })
})
