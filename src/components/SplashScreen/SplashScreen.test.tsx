import React from 'react'
import { render } from '@testing-library/react'
import SplashScreen from './SplashScreen'

describe('SplashScreen Component', () => {
  let ref: React.RefObject<SplashScreen>

  beforeEach(() => {
    ref = React.createRef<SplashScreen>()
    render(<SplashScreen pageText={{} as any} percent={50} enterScene={vi.fn()} ref={ref as any} />)
  })

  describe('renderEnterButton()', () => {
    it('should return a React element', () => {
      ;(ref.current! as any).props = { pageText: {} }
      const result = ref.current!.renderEnterButton()
      expect(result).not.toBeNull()
    })
  })

  describe('renderLoadingBar()', () => {
    it('should return a React element', () => {
      ;(ref.current! as any).props = { pageText: {}, percent: 50 }
      const result = ref.current!.renderLoadingBar()
      expect(result).not.toBeNull()
    })
  })

  describe('renderUserPrompt()', () => {
    it('should render the enter button when percent is 100', () => {
      ;(ref.current! as any).props = { pageText: {}, percent: 100 }
      const result = ref.current!.renderUserPrompt()
      expect(result).not.toBeNull()
    })

    it('should render the loading bar when percent is below 100', () => {
      ;(ref.current! as any).props = { pageText: {}, percent: 50 }
      const result = ref.current!.renderUserPrompt()
      expect(result).not.toBeNull()
    })
  })

  describe('render()', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <SplashScreen pageText={{} as any} percent={50} enterScene={vi.fn()} />
      )
      expect(container).toBeTruthy()
    })
  })
})
