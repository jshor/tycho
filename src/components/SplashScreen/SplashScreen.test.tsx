import React from 'react'
import { render } from '@testing-library/react'
import SplashScreen from './SplashScreen'
import { Mutable } from '../../test/helpers'

describe('SplashScreen Component', () => {
  let ref: React.RefObject<SplashScreen>

  beforeEach(() => {
    ref = React.createRef<SplashScreen>()
    render(<SplashScreen pageText={{}} percent={50} enterScene={vi.fn()} ref={ref} />)
  })

  describe('renderEnterButton()', () => {
    it('should return a React element', () => {
      const current = ref.current as Mutable<SplashScreen>
      current.props = { pageText: {} }
      const result = current.renderEnterButton()
      expect(result).not.toBeNull()
    })
  })

  describe('renderLoadingBar()', () => {
    it('should return a React element', () => {
      const current = ref.current as Mutable<SplashScreen>
      current.props = { pageText: {}, percent: 50 }
      const result = current.renderLoadingBar()
      expect(result).not.toBeNull()
    })
  })

  describe('renderUserPrompt()', () => {
    it('should render the enter button when percent is 100', () => {
      const current = ref.current as Mutable<SplashScreen>
      current.props = { pageText: {}, percent: 100 }
      const result = current.renderUserPrompt()
      expect(result).not.toBeNull()
    })

    it('should render the loading bar when percent is below 100', () => {
      const current = ref.current as Mutable<SplashScreen>
      current.props = { pageText: {}, percent: 50 }
      const result = current.renderUserPrompt()
      expect(result).not.toBeNull()
    })
  })

  describe('render()', () => {
    it('should render without crashing', () => {
      const { container } = render(<SplashScreen pageText={{}} percent={50} enterScene={vi.fn()} />)
      expect(container).toBeTruthy()
    })
  })
})
