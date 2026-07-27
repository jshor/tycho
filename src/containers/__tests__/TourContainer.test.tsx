import React from 'react'
import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { TourContainer } from '../TourContainer'
import { Mutable } from '../../test/helpers'
import Constants from '../../constants'

vi.useFakeTimers()

const labels = [
  { duration: 5000, text: 'Welcome to the Solar System' },
  { duration: 5000, text: 'This is a real-time interactive simulation' },
  { duration: 3000, text: "Let's start exploring" }
]

/** The value `initialize()` compares `tourViewed` against when deciding to skip the tour. */
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

const renderContainer = (props: Record<string, unknown> = {}) => {
  const ref = React.createRef<TourContainer>()
  const result = renderWithStore(<TourContainer {...baseProps} {...props} ref={ref} />)

  return { ref, ...result }
}

/** Advances timers inside `act()` so the labels' scheduled state changes are flushed. */
const advanceTimers = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('Tour Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('render()', () => {
    it('should render nothing when the scene is not playing', () => {
      const { container } = renderContainer({ playing: false })

      expect(container.firstChild).toBeNull()
    })

    it('should render the tour when the scene is playing', () => {
      const { container } = renderContainer({ playing: true })

      expect(container.querySelector('.tour')).not.toBeNull()
    })
  })

  describe('initialize()', () => {
    it('should start the tour when the scene is playing', () => {
      renderContainer({ playing: true })
      advanceTimers(0)

      expect(action.setCameraOrbit).toHaveBeenCalledWith(true)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
      expect(action.tourCompleted).not.toHaveBeenCalled()
    })

    it('should skip the tour when it was already viewed', () => {
      localStorage.setItem('tourViewed', TOUR_VIEWED_SKIP_VALUE)

      renderContainer({ playing: true })
      advanceTimers(TOUR_DURATION)

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledTimes(1)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should only initialize once, no matter how many times it renders', () => {
      const { ref } = renderContainer({ playing: true })

      act(() => ref.current?.forceUpdate())
      ref.current?.initialize()
      advanceTimers(0)

      expect(action.setCameraOrbit).toHaveBeenCalledTimes(1)
    })
  })

  describe('initializeTour()', () => {
    it('should complete the tour once every label has played', () => {
      renderContainer({ playing: true })
      advanceTimers(TOUR_DURATION - 1)

      expect(action.tourCompleted).not.toHaveBeenCalled()

      advanceTimers(1)

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(localStorage.getItem('tourViewed')).toEqual('true')
    })
  })

  describe('skipTour()', () => {
    it('should complete the tour, restore the UI controls and persist that it was viewed', () => {
      const { ref } = renderContainer()
      const container = ref.current as Mutable<TourContainer>

      container.skipTour()

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
      expect(localStorage.getItem('tourViewed')).toEqual('true')
    })

    it('should skip the tour when the skip link is clicked', () => {
      const { container } = renderContainer({ playing: true })

      vi.clearAllMocks()
      fireEvent.click(container.querySelector('.tour__skip-link'))

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })
  })

  describe('getLabels()', () => {
    it('should return a label element for each tour item', () => {
      const { ref } = renderContainer()
      const result = ref.current?.getLabels(labels)

      expect(result).toHaveLength(labels.length)
    })

    it('should separate each label by the separation interval', () => {
      const { ref } = renderContainer()
      const separation = Constants.Tour.SEPARATION_INTERVAL
      const result = ref.current?.getLabels(labels)

      let expectedStart = separation

      result?.forEach((label, index) => {
        expect(label.props.text).toEqual(labels[index].text)
        expect(label.props.start).toEqual(expectedStart)
        expect(label.props.end).toEqual(expectedStart + labels[index].duration)

        expectedStart += labels[index].duration + separation
      })
    })
  })
})
