import { act } from '@testing-library/react'
import { useFrame } from '@react-three/fiber'
import { renderWithStore } from '../../test/render'
import useStore from '../../store'
import App from '../app'
import { OrbitalData, PageText, Store } from '../../types'

/** Clock's methods are instance properties, so the whole module stands in for the real clock. */
const clock = vi.hoisted(() => ({
  getTime: vi.fn(),
  speed: vi.fn(),
  update: vi.fn(),
  stop: vi.fn(),
  continue: vi.fn(),
  setOffset: vi.fn(),
  stopped: false
}))

vi.mock('../../utils/Clock', () => ({ default: vi.fn(() => clock) }))

const requestOrbitalData = vi.fn()
const requestPageText = vi.fn()

const orbitalData: OrbitalData[] = []

const withData = { orbitalData, pageText: {} as PageText }

/**
 * Runs the scene's animation tick, which the mocked `useFrame` registers but never calls on its
 * own. It is the first frame callback registered — see CanvasContent in the scene module.
 */
const advanceFrame = () => {
  const [tick] = vi.mocked(useFrame).mock.calls[0]

  tick(null, 0, null)
}

describe('App Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clock.getTime.mockReturnValue(1)
    clock.stopped = false
  })

  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<App />, { requestOrbitalData, requestPageText, ...state })
  }

  describe('render()', () => {
    it('should show the splash screen until the app data arrives', () => {
      const { container } = renderModule()

      expect(container.querySelector('.splash-screen')).not.toBeNull()
      expect(container.querySelector('.uicontrols')).toBeNull()
    })

    it('should show the app once the data has arrived', () => {
      const { container } = renderModule(withData)

      expect(container.querySelector('.uicontrols')).not.toBeNull()
    })
  })

  describe('mount', () => {
    it('should request the orbital data and page text', () => {
      renderModule()

      expect(requestOrbitalData).toHaveBeenCalledTimes(1)
      expect(requestPageText).toHaveBeenCalledTimes(1)
    })

    it('should report the clock time to the store, even while paused', () => {
      clock.getTime.mockReturnValue(42)

      renderModule()

      expect(useStore.getState().time).toEqual(42)
    })
  })

  describe('onAnimate()', () => {
    it('should report each new time to the store while playing', () => {
      renderModule({ ...withData, playing: true })

      clock.getTime.mockReturnValue(2)
      advanceFrame()

      expect(useStore.getState().time).toEqual(2)
    })

    it('should not report a time that has not changed', () => {
      renderModule({ ...withData, playing: true })

      useStore.setState({ time: undefined })
      advanceFrame()

      expect(useStore.getState().time).toBeUndefined()
    })

    it('should not report a new time while paused', () => {
      renderModule({ ...withData, playing: false })

      clock.getTime.mockReturnValue(2)
      useStore.setState({ time: undefined })
      advanceFrame()

      expect(useStore.getState().time).toBeUndefined()
    })

    it('should apply the current speed to the clock', () => {
      renderModule({ ...withData, speed: 2 })

      advanceFrame()

      expect(clock.speed).toHaveBeenCalledWith(2)
      expect(clock.update).toHaveBeenCalled()
    })

    it('should restart the clock once the simulation resumes', () => {
      clock.stopped = true

      renderModule({ ...withData, playing: true })
      advanceFrame()

      expect(clock.continue).toHaveBeenCalledTimes(1)
    })

    it('should halt the clock once the simulation pauses', () => {
      renderModule({ ...withData, playing: false })

      advanceFrame()

      expect(clock.stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('timeOffset', () => {
    it('should move the running clock to a newly picked time', () => {
      renderModule({ ...withData, playing: true, timeOffset: 0 })

      act(() => useStore.setState({ timeOffset: 123 }))

      expect(clock.setOffset).toHaveBeenCalledWith(123)
    })

    it('should leave the clock alone while the simulation is paused', () => {
      renderModule({ ...withData, playing: false, timeOffset: 0 })

      act(() => useStore.setState({ timeOffset: 123 }))

      expect(clock.setOffset).not.toHaveBeenCalled()
    })

    it('should leave the clock alone when the time was not picked anew', () => {
      renderModule({ ...withData, playing: true, timeOffset: 123 })

      act(() => useStore.setState({ timeOffset: 123 }))

      expect(clock.setOffset).not.toHaveBeenCalled()
    })
  })
})
