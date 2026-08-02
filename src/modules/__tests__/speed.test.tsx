import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { Speed } from '../speed'
import { Constants } from '../../constants'

const { MIN } = Constants.UI.Speed

describe('Speed Module', () => {
  describe('render()', () => {
    it('should show the speed the simulation is running at', () => {
      const { container } = renderWithStore(<Speed />, { speed: 3 })

      expect(container.querySelector('.speed__exponent')?.textContent).toEqual('3')
    })

    it('should show real time before a speed has been chosen', () => {
      const { container } = renderWithStore(<Speed />)

      expect(container.querySelector('.speed__exponent')?.textContent).toEqual(String(MIN))
    })
  })

  describe('changeSpeed()', () => {
    /** Opens the slider and nudges it up a power of ten. */
    const slideSpeed = (speed?: number) => {
      const { container } = renderWithStore(<Speed />, { speed })

      fireEvent.click(container.querySelector('.speed__button'))
      fireEvent.focus(container.querySelector('.slider__handle'))
      fireEvent.keyDown(document, { key: 'ArrowRight' })
    }

    it('should run the simulation at the speed the user slid to', () => {
      slideSpeed(2)

      expect(useStore.getState().speed).toEqual(3)
    })

    it('should step up from real time when no speed has been chosen', () => {
      slideSpeed()

      expect(useStore.getState().speed).toEqual(MIN + 1)
    })

    it('should leave the speed alone when the button is only opening the slider', () => {
      const { container } = renderWithStore(<Speed />, { speed: 2 })

      fireEvent.click(container.querySelector('.speed__button'))

      expect(useStore.getState().speed).toEqual(2)
    })
  })
})
