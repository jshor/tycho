import { create } from 'zustand'
import { OrbitalData, PageText, Store } from '../types'
import { env } from '../utils/Environment'

export const useStore = create<Store>()((set) => ({
  /**
   * Fetches the orbital data.
   */
  requestOrbitalData: () => {
    return fetch(env('/static/data/orbitals.json'))
      .then((res) => res.json())
      .then((orbitalData: OrbitalData[]) => set({ orbitalData }))
  },

  /**
   * Fetches the translated page text.
   */
  requestPageText: () => {
    return fetch(env('/static/data/pageText.json'))
      .then((res) => res.json())
      .then((pageText: PageText) => set({ pageText }))
  },

  /**
   * Sets the active orbital target.
   */
  setActiveOrbital: (targetId, targetName, animateTargetChange = true) =>
    set({ targetId, targetName, animateTargetChange }),

  /**
   * Adds the given orbital to the list of highlighted orbitals.
   */
  addHighlightedOrbital: (highlightedOrbital) =>
    set(({ highlightedOrbitals }) => ({
      highlightedOrbitals: Array.isArray(highlightedOrbitals)
        ? [...highlightedOrbitals, highlightedOrbital]
        : [highlightedOrbital]
    })),

  /**
   * Removes the given orbital from the list of highlighted orbitals.
   */
  removeHighlightedOrbital: (highlightedOrbital) =>
    set(({ highlightedOrbitals }) => ({
      highlightedOrbitals: Array.isArray(highlightedOrbitals)
        ? highlightedOrbitals.filter((orbital) => orbital !== highlightedOrbital)
        : []
    })),

  /**
   * Sets the percentage of assets loaded, based on the count and total.
   */
  setPercentLoaded: (count, total) => set({ percent: (count / total) * 100 }),

  /**
   * Changes the zoom level.
   */
  changeZoom: (zoom) => set({ zoom })
}))
