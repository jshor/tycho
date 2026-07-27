import { render } from '@testing-library/react'
import Settings from './Settings'
import { PageText } from '../../types'

describe('Settings Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Settings pageText={{} as PageText} />)
    expect(container).toBeTruthy()
  })
})
