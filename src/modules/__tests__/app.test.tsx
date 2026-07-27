import { useFrame } from '@react-three/fiber'
import { renderWithStore } from '../../test/render'
import { App } from '../app'
import { OrbitalData, PageText } from '../../types'

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

const action = {
  requestOrbitalData: vi.fn(),
  requestPageText: vi.fn(),
  setTime: vi.fn()
}

const orbitalData: OrbitalData[] = []

const withData = { orbitalData, pageText: {} as PageText }

const initialState = { data: { orbitalData } }

/**
 * Runs the scene's animation tick, which the mocked `useFrame` registers but never calls on its
 * own. It is the first frame callback registered — see CanvasContent in Scene.
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

  describe('render()', () => {
    it('should show the splash screen until the app data arrives', () => {
      const { container } = renderWithStore(<App action={action} />)

      expect(container.querySelector('.splash-screen')).not.toBeNull()
      expect(container.querySelector('.uicontrols')).toBeNull()
    })

    it('should show the app once the data has arrived', () => {
      const { container } = renderWithStore(<App action={action} {...withData} />, initialState)

      expect(container.querySelector('.uicontrols')).not.toBeNull()
    })
  })

  describe('componentDidMount()', () => {
    it('should request the orbital data and page text', () => {
      renderWithStore(<App action={action} />)

      expect(action.requestOrbitalData).toHaveBeenCalledTimes(1)
      expect(action.requestPageText).toHaveBeenCalledTimes(1)
    })

    it('should report the clock time to the store, even while paused', () => {
      clock.getTime.mockReturnValue(42)

      renderWithStore(<App action={action} />)

      expect(action.setTime).toHaveBeenCalledWith(42)
    })
  })

  describe('onAnimate()', () => {
    it('should report each new time to the store while playing', () => {
      renderWithStore(<App action={action} {...withData} playing />, initialState)

      clock.getTime.mockReturnValue(2)
      advanceFrame()

      expect(action.setTime).toHaveBeenLastCalledWith(2)
    })

    it('should not report a time that has not changed', () => {
      renderWithStore(<App action={action} {...withData} playing />, initialState)

      action.setTime.mockClear()
      advanceFrame()

      expect(action.setTime).not.toHaveBeenCalled()
    })

    it('should not report a new time while paused', () => {
      renderWithStore(<App action={action} {...withData} playing={false} />, initialState)

      clock.getTime.mockReturnValue(2)
      action.setTime.mockClear()
      advanceFrame()

      expect(action.setTime).not.toHaveBeenCalled()
    })

    it('should apply the current speed to the clock', () => {
      renderWithStore(<App action={action} {...withData} speed={2} />, initialState)

      advanceFrame()

      expect(clock.speed).toHaveBeenCalledWith(2)
      expect(clock.update).toHaveBeenCalled()
    })

    it('should restart the clock once the simulation resumes', () => {
      clock.stopped = true

      renderWithStore(<App action={action} {...withData} playing />, initialState)
      advanceFrame()

      expect(clock.continue).toHaveBeenCalledTimes(1)
    })

    it('should halt the clock once the simulation pauses', () => {
      renderWithStore(<App action={action} {...withData} playing={false} />, initialState)

      advanceFrame()

      expect(clock.stop).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeUpdateOffset()', () => {
    it('should move the running clock to a newly picked time', () => {
      const { rerender } = renderWithStore(
        <App action={action} {...withData} playing timeOffset={0} />,
        initialState
      )

      rerender(<App action={action} {...withData} playing timeOffset={123} />)

      expect(clock.setOffset).toHaveBeenCalledWith(123)
    })

    it('should leave the clock alone while the simulation is paused', () => {
      const { rerender } = renderWithStore(
        <App action={action} {...withData} playing={false} timeOffset={0} />,
        initialState
      )

      rerender(<App action={action} {...withData} playing={false} timeOffset={123} />)

      expect(clock.setOffset).not.toHaveBeenCalled()
    })

    it('should leave the clock alone when the time was not picked anew', () => {
      const { rerender } = renderWithStore(
        <App action={action} {...withData} playing timeOffset={123} />,
        initialState
      )

      rerender(<App action={action} {...withData} playing timeOffset={123} />)

      expect(clock.setOffset).not.toHaveBeenCalled()
    })
  })
})
