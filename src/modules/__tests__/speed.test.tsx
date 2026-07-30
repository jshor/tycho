import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { Speed } from '../speed'
import { Constants } from '../../constants'

const { MIN, MAX } = Constants.UI.Speed

describe('Speed Module', () => {
  const clickSpeed = (speed?: number) => {
    const { container } = renderWithStore(<Speed />, { speed })

    fireEvent.click(container.querySelector('.speed'))
  }

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

  describe('nextSpeed()', () => {
    it('should step up to the next power of ten when clicked', () => {
      clickSpeed(2)

      expect(useStore.getState().speed).toEqual(3)
    })

    it('should step up from real time when no speed has been chosen', () => {
      clickSpeed()

      expect(useStore.getState().speed).toEqual(MIN + 1)
    })

    it('should start over once the fastest speed has played', () => {
      clickSpeed(MAX)

      expect(useStore.getState().speed).toEqual(MIN)
    })
  })
})
