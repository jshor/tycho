import { renderWithStore } from '../../test/render'
import App from './app'
import orbitalData from '../scene/__fixtures__/orbitals.json'
import { OrbitalData } from '../../types'

describe('App Component', () => {
  it('should render without crashing', () => {
    const { container } = renderWithStore(<App onAnimate={vi.fn()} pageText={{}} />, {
      data: { orbitalData: orbitalData as OrbitalData[] }
    })
    expect(container).toBeTruthy()
  })
})
