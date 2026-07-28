import { render } from '@testing-library/react'
import { SplashScreen } from './splashScreen'

describe('SplashScreen Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<SplashScreen pageText={{}} percent={50} enterScene={vi.fn()} />)

    expect(container).toBeTruthy()
  })

  it('should render the loading bar until the scene has fully loaded', () => {
    const { container } = render(<SplashScreen pageText={{}} percent={50} />)
    const bar = container.querySelector('.splash-screen__loading-bar') as HTMLElement

    expect(bar).not.toBeNull()
    expect(bar.style.width).toEqual('50%')
    expect(container.querySelector('.splash-screen__button-anchor')).toBeNull()
  })

  it('should render the enter button once the scene has fully loaded', () => {
    const { container } = render(
      <SplashScreen pageText={{ start: 'Start' }} percent={100} enterScene={vi.fn()} />
    )

    expect(container.querySelector('.splash-screen__button-anchor')?.textContent).toEqual('Start')
    expect(container.querySelector('.splash-screen__loading-bar')).toBeNull()
  })

  it('should show the splash screen only while `show` is set', () => {
    const { container: hidden } = render(<SplashScreen pageText={{}} percent={50} />)
    const { container: shown } = render(<SplashScreen pageText={{}} percent={50} show />)

    expect(hidden.querySelector('.splash-screen--hide')).not.toBeNull()
    expect(shown.querySelector('.splash-screen--show')).not.toBeNull()
  })
})
