import { render } from '@testing-library/react'
import { OrbitalSymbol, getSymbolText } from './orbitalSymbol'

describe('Orbital Symbol Component', () => {
  describe('getSymbolText()', () => {
    it('should spell out a sign of its own, as Jupiter has', () => {
      expect(getSymbolText('2643')).toEqual('♃')
    })

    it('should spell out a sign above the basic plane, as Earth has', () => {
      expect(getSymbolText('1f728')).toEqual('\u{1F728}')
    })

    it('should spell a moon out as its planet and its place in orbit, which the font draws as one', () => {
      // Io is Jupiter I, and Iapetus is Saturn VIII
      expect(getSymbolText('2643-49')).toEqual('♃I')
      expect(getSymbolText('2644-56-49-49-49')).toEqual('♄VIII')
    })

    it('should spell out nothing for a body with no sign of its own', () => {
      expect(getSymbolText()).toEqual('')
      expect(getSymbolText('')).toEqual('')
    })
  })

  describe('render()', () => {
    it('should draw the sign it is given', () => {
      const { container } = render(<OrbitalSymbol symbol="2642" />)

      expect(container.querySelector('.orbital-symbol')?.textContent).toEqual('♂')
    })

    it('should keep out of the way of a screen reader, which has the name to read out', () => {
      const { container } = render(<OrbitalSymbol symbol="2642" />)

      expect(container.querySelector('.orbital-symbol')?.getAttribute('aria-hidden')).toEqual(
        'true'
      )
    })

    it('should draw nothing at all for a body with no sign', () => {
      const { container } = render(<OrbitalSymbol />)

      expect(container.querySelector('.orbital-symbol')).toBeNull()
    })
  })
})
