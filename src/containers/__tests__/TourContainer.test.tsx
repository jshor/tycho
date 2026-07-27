import React from 'react'
import { renderWithStore } from '../../test/render'
import { TourContainer } from '../TourContainer'
import { Mutable } from '../../test/helpers'
import TourService from '../../services/TourService'

vi.useFakeTimers()

const labels = [
  { duration: 5000, text: 'Welcome to the Solar System' },
  { duration: 5000, text: 'This is a real-time interactive simulation' },
  { duration: 3000, text: "Let's start exploring" }
]

const action = {
  setUIControls: vi.fn(),
  setCameraOrbit: vi.fn(),
  setActiveOrbital: vi.fn(),
  setLabelText: vi.fn(),
  tourCompleted: vi.fn(),
  tourSkipped: vi.fn()
}

const baseProps = { labels, action, pageText: {} }

describe('Tour Container', () => {
  let ref: React.RefObject<TourContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<TourContainer>()
    renderWithStore(<TourContainer {...baseProps} ref={ref} />)
  })

  describe('componentDidMount()', () => {
    it('should call tourSkipped when canSkip() returns true', () => {
      TourService.canSkip = () => true
      ref.current?.componentDidMount?.()
      expect(action.tourSkipped).toHaveBeenCalledWith(true)
    })

    it('should not call tourSkipped when canSkip() returns false', () => {
      vi.clearAllMocks()
      TourService.canSkip = () => false
      ref.current?.componentDidMount?.()
      expect(action.tourSkipped).not.toHaveBeenCalled()
    })
  })

  describe('componentDidUpdate()', () => {
    it('should call maybeSkipTour()', () => {
      const spy = vi.spyOn(ref.current, 'maybeSkipTour')
      ref.current?.componentDidUpdate({})
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call maybeStartTour()', () => {
      const spy = vi.spyOn(ref.current, 'maybeStartTour')
      ref.current?.componentDidUpdate({})
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeSkipTour()', () => {
    it('should skip tour when isSkipped changes to true', () => {
      const container = ref.current as Mutable<TourContainer>
      const spy = vi.spyOn(container, 'skipTour')

      container.props = { ...baseProps, isSkipped: true }
      container.maybeSkipTour({ isSkipped: false })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not skip if isSkipped did not change', () => {
      const container = ref.current as Mutable<TourContainer>
      const spy = vi.spyOn(container, 'skipTour')

      container.props = { ...baseProps, isSkipped: true }
      container.maybeSkipTour({ isSkipped: true })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('maybeStartTour()', () => {
    it('should initialize tour when playing transitions to true', () => {
      const container = ref.current as Mutable<TourContainer>
      const spy = vi.spyOn(container, 'initializeTour')

      container.props = {
        ...baseProps,
        playing: true,
        isComplete: false
      }
      container.maybeStartTour({ playing: false })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not start tour if already complete', () => {
      const container = ref.current as Mutable<TourContainer>
      const spy = vi.spyOn(container, 'initializeTour')

      container.props = {
        ...baseProps,
        playing: true,
        isComplete: true
      }
      container.maybeStartTour({ playing: false })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('initializeTour()', () => {
    it('should call setUIControls and setCameraOrbit when canSkip is false', () => {
      TourService.canSkip = () => false
      const container = ref.current as Mutable<TourContainer>
      container.props = { ...baseProps, action, labels }

      container.initializeTour()

      expect(action.setUIControls).toHaveBeenCalledWith(false)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(true)
    })
  })

  describe('skipTour()', () => {
    it('should complete the tour and restore UI controls', () => {
      const container = ref.current as Mutable<TourContainer>
      container.props = { ...baseProps, action }

      container.skipTour()

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
      expect(action.setCameraOrbit).toHaveBeenCalledWith(false)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })
  })

  describe('onTourComplete()', () => {
    it('should mark the tour as completed', () => {
      const container = ref.current as Mutable<TourContainer>
      container.props = { ...baseProps, action }

      container.onTourComplete()

      expect(action.tourCompleted).toHaveBeenCalledWith(true)
    })
  })

  describe('shouldRunTour()', () => {
    it('should return true when playing and not skipped', () => {
      const current = ref.current as Mutable<TourContainer>
      current.props = {
        ...baseProps,
        playing: true,
        isSkipped: false
      }
      expect(current.shouldRunTour()).toBe(true)
    })

    it('should return false when skipped', () => {
      const current = ref.current as Mutable<TourContainer>
      current.props = {
        ...baseProps,
        playing: true,
        isSkipped: true
      }
      expect(current.shouldRunTour()).toBe(false)
    })
  })

  describe('getLabels()', () => {
    it('should return a label element for each tour item', () => {
      const result = ref.current?.getLabels(labels)
      expect(result).toHaveLength(labels.length)
    })
  })

  describe('render()', () => {
    it('should return null when tour should not run', () => {
      const { container: dom } = renderWithStore(
        <TourContainer labels={labels} action={action} pageText={{}} playing={false} />
      )
      expect(dom.firstChild).toBeNull()
    })
  })
})
