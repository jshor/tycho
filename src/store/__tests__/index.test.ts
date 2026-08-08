import { useStore } from '../'
import orbitalFixtures from './__fixtures__/orbitals.json'
import pageTextFixtures from './__fixtures__/pageText.json'
import { OrbitalData } from '../../types'

/**
 * Stands in for the network, handing back the given JSON.
 */
const mockJsonFetch = (jsonData: object) => {
  return vi.fn().mockResolvedValue({ json: () => jsonData })
}

describe('Store', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start with no state set', () => {
    const { time, playing, orbitalData, targetId, activeModal } = useStore.getState()

    expect(time).toBeUndefined()
    expect(playing).toBeUndefined()
    expect(orbitalData).toBeUndefined()
    expect(targetId).toBeUndefined()
    expect(activeModal).toBeUndefined()
  })

  describe('requestOrbitalData()', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', mockJsonFetch(orbitalFixtures))
    })

    it('should request orbitals.json', async () => {
      await useStore.getState().requestOrbitalData()

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/static/data/orbitals.json'))
    })

    it('should store the orbital data it fetched', async () => {
      await useStore.getState().requestOrbitalData()

      expect(useStore.getState().orbitalData).toEqual(orbitalFixtures)
    })
  })

  describe('requestPageText()', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', mockJsonFetch(pageTextFixtures))
    })

    it('should request pageText.json', async () => {
      await useStore.getState().requestPageText()

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/static/data/pageText.json'))
    })

    it('should store the page text it fetched', async () => {
      await useStore.getState().requestPageText()

      expect(useStore.getState().pageText).toEqual(pageTextFixtures)
    })
  })

  describe('setActiveOrbitalId()', () => {
    const orbitalData = orbitalFixtures as unknown as OrbitalData[]

    beforeEach(() => {
      useStore.setState({ orbitalData })
    })

    it('should focus the camera on the given orbital', () => {
      useStore.getState().setActiveOrbitalId('dummyParent')

      const { targetId, targetName } = useStore.getState()

      expect(targetId).toEqual('dummyParent')
      expect(targetName).toEqual('Dummy Planet')
    })

    it('should animate its way to the orbital', () => {
      useStore.getState().setActiveOrbitalId('dummyParent')

      expect(useStore.getState().animateTargetChange).toBe(true)
    })

    it('should put away whatever modal was open, so the camera is left a clear view', () => {
      useStore.setState({ activeModal: 'TEST_MODAL' })
      useStore.getState().setActiveOrbitalId('dummyParent')

      expect(useStore.getState().activeModal).toBeNull()
    })

    it('should still focus an orbital the data has never heard of', () => {
      useStore.getState().setActiveOrbitalId('bogus')

      const { targetId, targetName } = useStore.getState()

      expect(targetId).toEqual('bogus')
      expect(targetName).toBeUndefined()
    })
  })

  describe('setHighlightedId()', () => {
    it('should highlight the given orbital', () => {
      useStore.getState().setHighlightedId('earth')

      expect(useStore.getState().highlightedId).toEqual('earth')
    })

    it('should highlight one orbital at a time', () => {
      useStore.getState().setHighlightedId('earth')
      useStore.getState().setHighlightedId('mars')

      expect(useStore.getState().highlightedId).toEqual('mars')
    })

    it('should drop the highlight when given nothing to highlight', () => {
      useStore.getState().setHighlightedId('earth')
      useStore.getState().setHighlightedId(undefined)

      expect(useStore.getState().highlightedId).toBeUndefined()
    })
  })

  describe('setPercentLoaded()', () => {
    it('should record the count as a percentage of the total', () => {
      useStore.getState().setPercentLoaded(1, 4)

      expect(useStore.getState().percent).toEqual(25)
    })

    it('should reach 100 once everything has loaded', () => {
      useStore.getState().setPercentLoaded(4, 4)

      expect(useStore.getState().percent).toEqual(100)
    })
  })

  describe('changeZoom()', () => {
    it('should apply a new zoom level', () => {
      useStore.getState().changeZoom(50)

      expect(useStore.getState().zoom).toEqual(50)
    })
  })

  describe('target', () => {
    const orbitalData = orbitalFixtures as unknown as OrbitalData[]

    beforeEach(() => {
      useStore.setState({ orbitalData })
    })

    it('should give the orbital the camera is focused on', () => {
      useStore.getState().setActiveOrbitalId('dummyParent')

      expect(useStore.getState().target?.id).toEqual('dummyParent')
    })

    it('should find a satellite of the orbitals it was given', () => {
      useStore.getState().setActiveOrbitalId('dummyChild')

      expect(useStore.getState().target?.id).toEqual('dummyChild')
    })

    it('should follow the camera onto whichever orbital it is sent to next', () => {
      useStore.getState().setActiveOrbitalId('dummyParent')
      useStore.getState().setActiveOrbitalId('dummyPlanet')

      expect(useStore.getState().target?.id).toEqual('dummyPlanet')
    })

    it('should stay with the target no matter how much else has been set since', () => {
      // the state is merged anew on every change, which once left the target behind
      useStore.getState().setActiveOrbitalId('dummyParent')
      useStore.setState({ time: 1 })
      useStore.setState({ zoom: 50 })

      expect(useStore.getState().target?.id).toEqual('dummyParent')
    })

    it('should give nothing while the camera is focused on nothing', () => {
      expect(useStore.getState().target).toBeUndefined()
    })

    it('should give nothing for an orbital the data has never heard of', () => {
      useStore.getState().setActiveOrbitalId('bogus')

      expect(useStore.getState().target).toBeUndefined()
    })
  })
})
