import React from 'react'
import { renderWithStore } from '../../test/render'
import { AppContainer } from '../AppContainer'
import { Mutable } from '../../test/helpers'
import { PageText } from '../../types'

const action = {
  requestOrbitalData: vi.fn(),
  requestPageText: vi.fn(),
  setTime: vi.fn()
}

describe('App Container', () => {
  let ref: React.RefObject<AppContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<AppContainer>()
    renderWithStore(<AppContainer action={action} ref={ref} />)
  })

  describe('componentDidMount()', () => {
    it('should request orbital data', () => {
      expect(action.requestOrbitalData).toHaveBeenCalledTimes(1)
    })

    it('should request page text', () => {
      expect(action.requestPageText).toHaveBeenCalledTimes(1)
    })
  })

  describe('componentDidUpdate()', () => {
    it('should call maybeUpdateOffset()', () => {
      const container = ref.current
      const spy = vi.spyOn(container, 'maybeUpdateOffset')

      container.componentDidUpdate({})

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeUpdateOffset()', () => {
    it('should update the clock offset when scene is playing and timeOffset changed', () => {
      const container = ref.current as Mutable<AppContainer>
      const spy = vi.spyOn(container.clock, 'setOffset')
      const timeOffset = 123

      container.props = { playing: true, timeOffset }
      container.maybeUpdateOffset({ timeOffset: 0 })

      expect(spy).toHaveBeenCalledWith(timeOffset)
    })

    it('should not update the clock when timeOffset is unchanged', () => {
      const current = ref.current as Mutable<AppContainer>
      const container = ref.current as Mutable<AppContainer>
      const spy = vi.spyOn(container.clock, 'setOffset')

      container.props = { playing: true, timeOffset: 123 }
      container.maybeUpdateOffset({ timeOffset: 123 })

      expect(spy).not.toHaveBeenCalled()
    })

    it('should not update the clock if scene is paused', () => {
      const container = ref.current as Mutable<AppContainer>
      const spy = vi.spyOn(container.clock, 'setOffset')

      container.props = { playing: false, timeOffset: 123 }
      container.maybeUpdateOffset({ timeOffset: 0 })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('maybeUpdateTime()', () => {
    it('should dispatch setTime when shouldUpdateTime() returns true', () => {
      const container = ref.current as Mutable<AppContainer>
      const setTime = vi.fn()
      const time = 42

      container.props = { action: { ...action, setTime } }
      vi.spyOn(container.clock, 'getTime').mockReturnValue(time)
      container.shouldUpdateTime = () => true

      container.maybeUpdateTime()

      expect(setTime).toHaveBeenCalledWith(time)
    })

    it('should dispatch setTime when forced', () => {
      const container = ref.current as Mutable<AppContainer>
      const setTime = vi.fn()
      const time = 42

      container.props = { action: { ...action, setTime } }
      vi.spyOn(container.clock, 'getTime').mockReturnValue(time)
      container.shouldUpdateTime = () => false

      container.maybeUpdateTime(true)

      expect(setTime).toHaveBeenCalledWith(time)
    })

    it('should not dispatch if not forced and shouldUpdateTime() is false', () => {
      const container = ref.current as Mutable<AppContainer>
      const setTime = vi.fn()

      container.props = { action: { ...action, setTime } }
      container.shouldUpdateTime = () => false

      container.maybeUpdateTime(false)

      expect(setTime).not.toHaveBeenCalled()
    })
  })

  describe('maybeContinue()', () => {
    it('should call continue() when playing and clock is stopped', () => {
      const container = ref.current as Mutable<AppContainer>
      const continueF = vi.fn()

      container.props = { playing: true }
      container.clock.continue = continueF
      container.clock.stopped = true

      container.maybeContinue()

      expect(continueF).toHaveBeenCalledTimes(1)
    })

    it('should not call continue() when clock is not stopped', () => {
      const container = ref.current as Mutable<AppContainer>
      const continueF = vi.fn()

      container.props = { playing: true }
      container.clock.continue = continueF
      container.clock.stopped = false

      container.maybeContinue()

      expect(continueF).not.toHaveBeenCalled()
    })
  })

  describe('maybeStop()', () => {
    it('should call stop() when not playing and clock is running', () => {
      const container = ref.current as Mutable<AppContainer>
      const stop = vi.fn()

      container.props = { playing: false }
      container.clock.stop = stop
      container.clock.stopped = false

      container.maybeStop()

      expect(stop).toHaveBeenCalledTimes(1)
    })

    it('should not call stop() when clock is already stopped', () => {
      const container = ref.current as Mutable<AppContainer>
      const stop = vi.fn()

      container.props = { playing: false }
      container.clock.stop = stop
      container.clock.stopped = true

      container.maybeStop()

      expect(stop).not.toHaveBeenCalled()
    })
  })

  describe('shouldUpdateTime()', () => {
    it('should return true when time changed and scene is playing', () => {
      const container = ref.current as Mutable<AppContainer>

      vi.spyOn(container.clock, 'getTime').mockReturnValue(1)
      container.lastTime = 2
      container.props = { playing: true }

      expect(container.shouldUpdateTime()).toBe(true)
    })

    it('should return false when scene is paused', () => {
      const container = ref.current as Mutable<AppContainer>

      vi.spyOn(container.clock, 'getTime').mockReturnValue(1)
      container.lastTime = 2
      container.props = { playing: false }

      expect(container.shouldUpdateTime()).toBe(false)
    })

    it('should return false when time has not changed', () => {
      const container = ref.current

      vi.spyOn(container.clock, 'getTime').mockReturnValue(1)
      container.lastTime = 1

      expect(container.shouldUpdateTime()).toBe(false)
    })
  })

  describe('onAnimate()', () => {
    it('should call clock.speed with the current speed', () => {
      const container = ref.current as Mutable<AppContainer>
      const speed = vi.fn()
      const update = vi.fn()

      container.props = {
        action: { ...action, setTime: vi.fn() },
        speed: 2
      }
      container.clock.speed = speed
      container.clock.update = update
      container.clock.stopped = false
      vi.spyOn(container.clock, 'getTime').mockReturnValue(0)

      container.onAnimate()

      expect(speed).toHaveBeenCalledWith(2)
    })
  })

  describe('render()', () => {
    it('should render SplashScreen when orbitalData is missing', () => {
      const { container: dom } = renderWithStore(<AppContainer action={action} />)
      expect(dom).toBeTruthy()
    })

    it('should render the app when orbitalData and pageText are present', () => {
      const { container: dom } = renderWithStore(
        <AppContainer action={action} orbitalData={[]} pageText={{} as PageText} />,
        { data: { orbitalData: [] } }
      )
      expect(dom).toBeTruthy()
    })
  })
})
