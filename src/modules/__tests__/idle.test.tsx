import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { Constants } from '../../constants'
import { Idle } from '../idle'
import { Store } from '../../types'

const held = { isAutoOrbitEnabled: false, controlsEnabled: true }

describe('Idle Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<Idle />, { interacted: 1, isComplete: true, ...state })
  }
  const interactWithScene = (interacted = 2) => act(() => useStore.setState({ interacted }))
  const wait = (duration: number) => act(() => vi.advanceTimersByTime(duration))
  const waitOut = () => wait(Constants.UI.IDLE_INTERVAL)

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('idle()', () => {
    it('should orbit the scene on its own once the user leaves it alone', () => {
      renderModule(held)
      waitOut()

      const { isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(true)
      expect(controlsEnabled).toBe(false)
    })

    it('should leave the scene in the user hands until the wait is up', () => {
      renderModule(held)
      wait(Constants.UI.IDLE_INTERVAL - 1)

      const { isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(false)
      expect(controlsEnabled).toBe(true)
    })

    it('should measure the wait from the last time the user interacted with the scene', () => {
      renderModule(held)

      wait(Constants.UI.IDLE_INTERVAL - 1)
      interactWithScene()
      wait(Constants.UI.IDLE_INTERVAL - 1)

      expect(useStore.getState().isAutoOrbitEnabled).toBe(false)

      wait(1)

      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
    })

    it('should mark the scene as idling, so the prompts it left behind stay away', () => {
      renderModule(held)
      waitOut()

      expect(useStore.getState().isIdle).toBe(true)
    })

    it('should count a scene the camera hands back down as well', () => {
      renderModule({ isAutoOrbitEnabled: true, controlsEnabled: false })

      // the camera hands the scene back where it lands, without the user interacting with it
      act(() => useStore.setState({ controlsEnabled: true }))
      waitOut()

      expect(useStore.getState().controlsEnabled).toBe(false)
    })

    it('should leave the orbit the tour is turning to run', () => {
      renderModule({ isAutoOrbitEnabled: true, controlsEnabled: false })
      waitOut()

      const { isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(true)
      expect(controlsEnabled).toBe(false)
    })

    it('should hold the wait while a modal has the scene', () => {
      renderModule({ ...held, activeModal: 'TEST_MODAL' })
      waitOut()

      expect(useStore.getState().isAutoOrbitEnabled).toBe(false)
      expect(useStore.getState().controlsEnabled).toBe(true)
    })

    it('should leave the scene alone once it has left the page', () => {
      const { unmount } = renderModule(held)

      unmount()
      waitOut()

      expect(useStore.getState().isAutoOrbitEnabled).toBe(false)
    })
  })

  describe('interact()', () => {
    it('should restore the scene to the user', () => {
      renderModule({ isIdle: true, isAutoOrbitEnabled: true, controlsEnabled: false })
      interactWithScene()

      const { isIdle, isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isIdle).toBe(false)
      expect(isAutoOrbitEnabled).toBe(false)
      expect(controlsEnabled).toBe(true)
    })

    it('should leave the scene to the tour for as long as it runs', () => {
      renderModule({ isComplete: false, isAutoOrbitEnabled: true, controlsEnabled: false })
      interactWithScene()

      // the tour orbits the scene through its narration, which a stray drag should not cut short
      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
      expect(useStore.getState().controlsEnabled).toBe(false)
    })

    it('should start the wait over again', () => {
      renderModule({ isAutoOrbitEnabled: true, controlsEnabled: false })
      interactWithScene()
      waitOut()

      expect(useStore.getState().isAutoOrbitEnabled).toBe(true)
      expect(useStore.getState().controlsEnabled).toBe(false)
    })

    it('should leave the opening orbit to run until the user first interacts with the scene', () => {
      renderModule({ interacted: undefined, isAutoOrbitEnabled: true, controlsEnabled: false })

      const { isAutoOrbitEnabled, controlsEnabled } = useStore.getState()

      expect(isAutoOrbitEnabled).toBe(true)
      expect(controlsEnabled).toBe(false)
    })

    it('should leave the scene to the modal that has it', () => {
      renderModule({ activeModal: 'TEST_MODAL', isAutoOrbitEnabled: true, controlsEnabled: false })
      interactWithScene()

      expect(useStore.getState().controlsEnabled).toBe(false)
    })

    it('should restore the scene once the modal holding it closes', () => {
      renderModule({ ...held, activeModal: 'TEST_MODAL' })

      act(() => useStore.setState({ activeModal: null }))
      waitOut()

      expect(useStore.getState().controlsEnabled).toBe(false)
    })
  })
})
