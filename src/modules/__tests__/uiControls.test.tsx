import { act, fireEvent, screen } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { UIControls } from '../uiControls'
import { Constants } from '../../constants'
import { OrbitalData, Store } from '../../types'
import { formatUnixTime, getUnixTime } from '../../utils/time'

const { MIN } = Constants.UI.Speed

/**
 * The display text for the given simulation time, as the module formats it.
 */
const formatted = (time: number) => {
  return formatUnixTime(time).replace(/ /g, ' ')
}

describe('UI Controls Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<UIControls />, state)
  }

  /**
   * The controls, which carry no names of their own and are found by where they hang instead.
   */
  const controls = (container: HTMLElement) => ({
    /** The `i` that opens the about modal, the only button down the left of the display. */
    about: container.querySelector('.ui-controls-layout__left .control-button') as HTMLElement,
    /** The name of the focused orbital, which opens its statistics. */
    label: container.querySelector('.ui-controls-layout__label') as HTMLElement,
    /** The first button on the right, ahead of the speed control beneath it. */
    playPause: container.querySelector('.ui-controls-layout__right .control-button') as HTMLElement,
    speed: container.querySelector('.speed-control .control-button') as HTMLElement,
    volume: container.querySelector('.volume') as HTMLElement,
    clock: container.querySelector('.date-picker__display') as HTMLElement
  })

  describe('openModal()', () => {
    it('should open the stats modal and hide the UI controls', () => {
      const { container } = renderModule({ targetName: 'Earth', controlsEnabled: true })

      fireEvent.click(controls(container).label)

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toEqual(Constants.UI.ModalTypes.STATS_MODAL)
      expect(controlsEnabled).toBe(false)
    })

    it('should open the about modal and hide the UI controls', () => {
      const { container } = renderModule({ controlsEnabled: true })

      fireEvent.click(controls(container).about)

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toEqual(Constants.UI.ModalTypes.ABOUT_MODAL)
      expect(controlsEnabled).toBe(false)
    })
  })

  describe('togglePlayer()', () => {
    it('should pause the simulation while it is playing', () => {
      const { container } = renderModule({ playing: true })

      fireEvent.click(controls(container).playPause)

      expect(useStore.getState().playing).toBe(false)
    })

    it('should play the simulation while it is paused', () => {
      const { container } = renderModule({ playing: false })

      fireEvent.click(controls(container).playPause)

      expect(useStore.getState().playing).toBe(true)
    })
  })

  describe('changeSpeed()', () => {
    /** Opens the slider and nudges it up a power of ten. */
    const slideSpeed = (container: HTMLElement) => {
      fireEvent.click(controls(container).speed)

      // the zoom slider is on screen too, so this is the handle of the one that just opened
      fireEvent.focus(container.querySelector('.speed-control .slider__handle') as HTMLElement)
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    }

    it('should show the speed the simulation is running at', () => {
      const { container } = renderModule({ speed: 3 })

      expect(container.querySelector('.speed-control__exponent')?.textContent).toEqual('3')
    })

    it('should show real time before a speed has been chosen', () => {
      const { container } = renderModule()

      expect(container.querySelector('.speed-control__exponent')?.textContent).toEqual(String(MIN))
    })

    it('should run the simulation at the speed the user slid to', () => {
      const { container } = renderModule({ speed: 2 })

      slideSpeed(container)

      expect(useStore.getState().speed).toEqual(3)
    })

    it('should step up from real time when no speed has been chosen', () => {
      const { container } = renderModule()

      slideSpeed(container)

      expect(useStore.getState().speed).toEqual(MIN + 1)
    })

    it('should leave the speed alone when the button is only opening the slider', () => {
      const { container } = renderModule({ speed: 2 })

      fireEvent.click(controls(container).speed)

      expect(useStore.getState().speed).toEqual(2)
    })
  })

  describe('render()', () => {
    it('should name the orbital the camera is focused on', () => {
      const { container } = renderModule({ targetName: 'Earth' })

      expect(container.querySelector('.ui-controls-layout__label')?.textContent).toEqual('Earth')
    })

    it('should wear the sign of the orbital alongside its name', () => {
      const { container } = renderModule({
        targetId: 'mars',
        targetName: 'Mars',
        target: { id: 'mars', name: 'Mars', symbol: '2642' } as OrbitalData
      })

      const label = container.querySelector('.ui-controls-layout__label')

      expect(label?.querySelector('.orbital-symbol')?.textContent).toEqual('♂')
      expect(label?.textContent).toContain('Mars')
    })

    it('should name a body the data has no sign for all the same', () => {
      const { container } = renderModule({ targetName: 'Earth' })

      expect(container.querySelector('.orbital-symbol')).toBeNull()
      expect(container.querySelector('.ui-controls-layout__label')?.textContent).toEqual('Earth')
    })

    it('should zoom the camera as the zoom slider moves', () => {
      renderModule({ zoom: 50 })
      act(() => useStore.getState().changeZoom(25))

      expect(useStore.getState().zoom).toEqual(25)
    })

    it('should count working the display as reaching for the scene', () => {
      const now = 12345
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const { container } = renderModule()

      fireEvent.pointerDown(controls(container).playPause)

      expect(useStore.getState().interacted).toEqual(now)
    })
  })

  describe('the date picker', () => {
    const time = getUnixTime(new Date('2024-01-01T12:00:00'))

    const getDisplay = (container: HTMLElement) => controls(container).clock?.textContent

    const openCalendar = (container: HTMLElement) => {
      fireEvent.click(controls(container).clock)
    }

    const pickDay = (day: RegExp) => {
      fireEvent.click(screen.getByRole('gridcell', { name: day }))
    }

    describe('render()', () => {
      it('should display the current simulation time', () => {
        const { container } = renderModule({ time: 1000000 })

        expect(getDisplay(container)).toEqual(formatted(1000000))
      })

      it('should display nothing until the simulation has a time', () => {
        const { container } = renderModule()

        expect(getDisplay(container)).toEqual('')
      })

      it('should re-read the clock as the simulation time changes', () => {
        const { container } = renderModule({ time: 1000000 })

        act(() => useStore.setState({ time: 2000000 }))

        expect(getDisplay(container)).toEqual(formatted(2000000))
      })
    })

    describe('changeTime()', () => {
      it('should move the simulation to the picked time', () => {
        const { container } = renderModule({ time })

        openCalendar(container)
        pickDay(/January 15th, 2024/)

        expect(useStore.getState().timeOffset).toEqual(getUnixTime(new Date('2024-01-15T12:00:00')))
      })

      it('should show the picked time on the readout', () => {
        const { container } = renderModule({ time })

        openCalendar(container)
        pickDay(/January 15th, 2024/)

        expect(getDisplay(container)).toEqual(
          formatted(getUnixTime(new Date('2024-01-15T12:00:00')))
        )
      })

      it('should hold the readout while the calendar is open, rather than move it under the user', () => {
        const { container } = renderModule({ time })

        openCalendar(container)
        act(() => useStore.setState({ time: 2000000 }))

        expect(getDisplay(container)).toEqual(formatted(time))
      })

      it('should re-read the clock once the calendar closes', () => {
        const { container } = renderModule({ time })

        openCalendar(container)
        fireEvent.keyDown(document.querySelector('.react-datepicker') as HTMLElement, {
          key: 'Escape'
        })
        act(() => useStore.setState({ time: 2000000 }))

        expect(getDisplay(container)).toEqual(formatted(2000000))
      })
    })
  })

  describe('triggerVolume()', () => {
    it('should unmute the scene while it is muted', () => {
      localStorage.setItem('volume', '0')

      const { container } = renderModule({ volume: 0 })

      fireEvent.click(controls(container).volume)

      expect(localStorage.getItem('volume')).toEqual('1')
      expect(useStore.getState().volume).toEqual(1)
    })

    it('should mute the scene while it is audible', () => {
      localStorage.setItem('volume', '1')

      const { container } = renderModule({ volume: 1 })

      fireEvent.click(controls(container).volume)

      expect(localStorage.getItem('volume')).toEqual('0')
      expect(useStore.getState().volume).toEqual(0)
    })
  })
})
