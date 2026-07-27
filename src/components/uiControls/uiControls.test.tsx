import { renderWithStore } from '../../test/render'
import UIControls from './uiControls'

describe('UIControls Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<UIControls pageText={{}} />)
    expect(container).toBeTruthy()
  })
})
