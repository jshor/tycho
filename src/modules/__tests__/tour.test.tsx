import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { Tour, Props } from '../tour'
import Constants from '../../constants'

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

const action = {
  setUIControls: vi.fn(),
  setCameraOrbit: vi.fn(),
  setActiveOrbital: vi.fn(),
  tourCompleted: vi.fn()
}

const baseProps = { labels, action, pageText: {} }

/** Advances timers inside `act()` so the labels' scheduled state changes are flushed. */
const advanceTimers = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Tour Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const renderModule = (props: Partial<Props> = {}) => {
    return renderWithStore(<Tour {...baseProps} {...props} />)
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

      expect(action.setCameraOrbit).toHaveBeenCalledWith(true)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
      expect(action.tourCompleted).not.toHaveBeenCalled()
    })

    it('should skip the tour when it was already viewed', () => {
      localStorage.setItem('tourViewed', TOUR_VIEWED_SKIP_VALUE)

      renderModule({ playing: true })
      advanceTimers(TOUR_DURATION)

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledTimes(1)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should not start the tour until the scene is playing', () => {
      const { rerender } = renderModule({ playing: false })

      advanceTimers(0)

      expect(action.setCameraOrbit).not.toHaveBeenCalled()

      rerender(<Tour {...baseProps} playing />)
      advanceTimers(0)

      expect(action.setCameraOrbit).toHaveBeenCalledWith(true)
    })

    it('should only initialize once, no matter how many times it renders', () => {
      const { rerender } = renderModule({ playing: true })

      rerender(<Tour {...baseProps} playing />)
      advanceTimers(0)

      expect(action.setCameraOrbit).toHaveBeenCalledTimes(1)
    })
  })

  describe('initializeTour()', () => {
    it('should complete the tour once every label has played', () => {
      renderModule({ playing: true })

      advanceTimers(TOUR_DURATION - 1)

      expect(action.tourCompleted).not.toHaveBeenCalled()

      advanceTimers(1)

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(localStorage.getItem('tourViewed')).toEqual('true')
    })
  })

  describe('skipTour()', () => {
    it('should end the tour, restore the UI controls and remember it was viewed', () => {
      const { container } = renderModule({ playing: true })

      vi.clearAllMocks()
      fireEvent.click(container.querySelector('.tour__skip-link'))

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
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

      /** The label currently on screen, if any. */
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
