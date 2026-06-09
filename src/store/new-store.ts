import { Vector3 } from 'three'
import createHook from 'zustand'
import create from 'zustand/vanilla'
import normalizeOrbitals from './normalize'
import { easeOut } from '../utils/easing'

export interface IPositionCoordinates {
  local: Vector3
  world: Vector3
}

export interface IEphemeris {
  nasaOrbitalCode: string,
  nasaBarycenterCode: string,
  revolutionOrder: string
}

export interface ITextureMap {
  slot: string,
  url: string,
  type: string
}

export interface IPeriapses {
  last: number,
  next: number
}

export interface IOrbital {
  id: string
  name: string,
  albedo: number,
  sidereal: number,
  radius: number,
  mass: number,
  centralMass: number,
  axialTilt: number,
  inclination: number,
  atmosphere: number,
  satellites: string[] // list of orbital IDs
  ephemeris: IEphemeris
  maps: ITextureMap[],
  argumentOfPeriapsis: number,
  eccentricity: number,
  longitudeOfAscendingNode: number,
  semimajor: number,
  semiminor: number,
  periapses: IPeriapses
}

/** How long a tween animation should last during time travel */
const TWEEN_DURATION = 2000

class Clock {
  /** How much time has elapsed since the last update, in milliseconds */
  elapsed = Date.now()
  /** Current clock time, in UNIX milliseconds */
  currentTime = Date.now()
  /**
   * The system time that the clock starting tweening at.
   * Used internally to keep track of where in the time travel animation we're at.
   */
  tweenStartTime = 0
  /** The current clock time to start tweening at */
  tweenFrom = 0
  /** The end clock time to tween to */
  tweenTo = 0

  updateTween = () => {
    const now = Date.now()
    const tweenElapsed = now - this.tweenStartTime
    const tweenPercent = tweenElapsed / TWEEN_DURATION

    if (tweenPercent < 1) {
      const tweenAmount = this.tweenTo - this.tweenFrom
      const delta = easeOut(tweenPercent) * tweenAmount

      this.currentTime = this.tweenFrom + delta
    } else {
      this.currentTime = this.tweenTo
      this.tweenStartTime = 0
      this.tweenFrom = 0
      this.tweenTo = 0
    }
  }

  updateTime = (animationSpeed: number) => {
    this.currentTime += (Date.now() - this.elapsed) * Math.pow(10, animationSpeed)
    this.elapsed = Date.now()
  }

  /**
   * Updates the current clock time.
   *
   * @param {number} animationSpeed - the speed factor to scale passing time by
   * @returns {number} current time in UNIX seconds, rounded to the nearest second
   */
  update = (animationSpeed: number, playing: boolean) => {
    if (this.tweenStartTime > 0) {
      this.updateTween()
    } else if (playing) {
      this.updateTime(animationSpeed)
    } else {
      // keep the elapsed marker current so resuming doesn't jump forward
      this.elapsed = Date.now()
    }

    return Math.ceil(this.currentTime / 1000) * 1000
  }

  timeTravel = (n: number) => {
    this.tweenStartTime = Date.now()
    this.tweenFrom = this.currentTime
    this.tweenTo = this.tweenFrom + n
  }
}



export type State = {
  orbitals: Record<string, IOrbital>,
  rootIds: string[],
  positions: Record<string, IPositionCoordinates>,
  focusedOrbitalId: string,
  focusedOrbitalPosition: Vector3,
  isChangingFocus: boolean,
  currentTime: number,
  animationSpeed: number,
  playing: boolean,
  scale: number,
  loadOrbitals: () => Promise<void>,
  updateClock: () => void,
  timeTravel: (n: number) => void,
  setAnimationSpeed: (speedScale: number) => void,
  setPlaying: (playing: boolean) => void,
  setScale: (scale: number) => void,
  setOrbitalPosition: (orbitalId: string, position: IPositionCoordinates) => void,
  setFocusedOrbital: (orbitalId: string, position: Vector3) => void,
  setIsChangingFocus: (isChangingFocus: boolean) => void
}

const clock = new Clock()

export const store = create<State>((set: any): State => ({
  orbitals: {},
  rootIds: [],
  positions: {},
  focusedOrbitalId: '',
  focusedOrbitalPosition: new Vector3(),
  isChangingFocus: false,

  currentTime: Date.now(),
  // 10^speed time multiplier; ~6 gives visible inner-planet motion at true
  // Keplerian periods (Earth completes an orbit in ~30s of real time)
  animationSpeed: 1,
  playing: true,
  /** Uniform size multiplier (1–10) applied to both body radii and orbit paths.
   *  Everything else abides by the source JSON — no further exaggeration. */
  scale: 1,

  async loadOrbitals () {
    const res = await fetch('/static/data/orbitals.json')
    const data = await res.json()
    const { orbitals, rootIds } = normalizeOrbitals(data)

    set(() => ({ orbitals, rootIds }))
  },

  updateClock () {
    set((state: State) => {
      // clock.update() will return UNIX milliseconds rounded to the nearest second
      // this will avoid updating the store needlessly when only milliseconds change
      const currentTime = clock.update(state.animationSpeed, state.playing)

      if (state.currentTime !== currentTime) {
        return { currentTime }
      }
    })
  },

  timeTravel (n: number) {
    clock.timeTravel(n)
  },

  setAnimationSpeed (animationSpeed: number) {
    set(() => {
      return { animationSpeed }
    })
  },

  setPlaying (playing: boolean) {
    set(() => ({ playing }))
  },

  setScale (scale: number) {
    set(() => ({ scale }))
  },

  setOrbitalPosition (orbitalId: string, position: IPositionCoordinates) {
    set((state: State) => {
      return {
        positions: {
          ...state.positions,
          [orbitalId]: position
        }
      }
    })
  },
  setFocusedOrbital (orbitalId: string, position: Vector3) {
    set((state: State) => {
      if (state.focusedOrbitalId === orbitalId) {
        // don't re-focus on an already-focused orbital
        return {}
      }

      return {
        isChangingFocus: true,
        focusedOrbitalId: orbitalId,
        focusedOrbitalPosition: position
      }
    })
  },
  setIsChangingFocus (isChangingFocus: boolean) {
    set(() => ({ isChangingFocus }))
  }
}))

export const useStore = createHook(store)
