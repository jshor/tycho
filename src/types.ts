// Shared TypeScript interfaces for the Tycho application

export interface Periapses {
  last: number
  next: number
}

export interface TextureMap {
  url: string
  slot?: string
}

export interface RingData {
  outerRadius: number
  barycenterTilt: number
  maps: TextureMap[]
}

/**
 * How a body's tail is drawn, for the bodies that grow one.
 */
export interface TailData {
  /**
   * How far the tail streams from the nucleus when fully grown, in scene units. 100 units is
   * 1e8 km, about the length Halley's tail actually reaches.
   */
  length: number
  /** How wide the tail fans out at its far end, in scene units. */
  width: number
  /**
   * The radius of the coma, as a multiple of the nucleus' visible radius. The real coma dwarfs
   * the nucleus by far more than this, but a coma that size would swallow the camera whenever it
   * focuses on the comet.
   */
  comaScale: number
  /**
   * How close to the sun the body must come to grow its full tail, in scene units. 450 units is
   * ~3 AU, inside which a comet's water ice begins to sublimate.
   */
  activeDistance: number
  /**
   * How much of a tail it keeps out where it is too cold to vent, from 0 to 1. A dormant comet is
   * a bare rock; it keeps a wisp so that it still reads as a comet out at aphelion, where Halley
   * spends most of its 76 years.
   */
  restActivity: number
  /** Color of the dust the nucleus sheds, which fans out around the tail. */
  dustColor: number
  /** Color of the ionised gas the solar wind blows straight back. */
  ionColor: number
}

export interface OrbitalData {
  id: string
  name: string
  /** The body's astronomical sign, as the hex codepoints that draw it (e.g. `2643-49` for Io). */
  symbol?: string
  radius: number
  semimajor: number
  semiminor: number
  eccentricity: number
  inclination: number
  longitudeOfAscendingNode: number
  argumentOfPeriapsis: number
  axialTilt: number
  sidereal: number
  centralMass: number
  atmosphere?: number
  isSatellite?: boolean
  periapses: Periapses
  satellites?: OrbitalData[]
  maps?: TextureMap[]
  rings?: RingData
  tail?: TailData
  description?: string
}

export interface WebGLPageText {
  noWebGl: string
  required: string
  enableInstructionsUrl: string
  clickHere: string
  learn: string
}

export interface StatsPageText {
  currentEarthTime: string
  velocityAtVector: string
  distanceToSun: string
  trueAnomaly: string
}

export interface AbbreviationsPageText {
  kilometers: string
  seconds: string
  theta: string
}

export interface PageText {
  aboutTitle?: string
  aboutInfo?: string
  webgl?: WebGLPageText
  start?: string
  skipTour?: string
  stats?: StatsPageText
  abbreviations?: AbbreviationsPageText
}

// Store

export interface Store {
  /** Whether or not the simulation is currently playing. */
  playing?: boolean
  /** The current simulation time, in seconds. */
  time?: number
  /** The orbital data for the Solar System. */
  orbitalData?: OrbitalData[]
  /** The translated page text for the app. */
  pageText?: PageText
  /** When the user last began interacting with the scene. */
  touched?: number
  /** The ID of the orbital the camera is focused on. */
  targetId?: string
  /** The name of the orbital the camera is focused on. */
  targetName?: string
  /** Whether or not the camera animates its way to a newly focused orbital. */
  animateTargetChange?: boolean
  /** The IDs of the orbitals whose paths are highlighted. */
  highlightedOrbitals?: string[]
  /** How much of the scene has loaded, from 0 to 100. */
  percent?: number
  /** The URL of the asset that most recently finished loading. */
  url?: string
  /** Whether or not the camera is orbiting its target on its own. */
  isAutoOrbitEnabled?: boolean
  /** Whether or not the tour has finished playing. */
  isComplete?: boolean
  /** The current zoom level. */
  zoom?: number
  /** The speed at which time passes in the simulation. */
  speed?: number
  /** The time the user picked on the calendar. */
  timeOffset?: number
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** The type of the modal currently open, if any. */
  activeModal?: string | null
  /** The volume of the scene's ambience [0, 1]. */
  volume?: number

  /** Fetches the orbital data for the Solar System. */
  requestOrbitalData: () => Promise<void>
  /** Fetches the translated page text for the app. */
  requestPageText: () => Promise<void>
  /** Focuses the camera on the given orbital. */
  setActiveOrbital: (targetId: string, targetName: string, animateTargetChange?: boolean) => void
  /** Highlights the given orbital's path. */
  addHighlightedOrbital: (highlightedOrbital: string) => void
  /** Stops highlighting the given orbital's path. */
  removeHighlightedOrbital: (highlightedOrbital: string) => void
  /** Records how far through loading its assets the scene is. */
  setPercentLoaded: (count: number, total: number) => void
  /** Applies a new zoom level. */
  changeZoom: (zoom: number) => void
}

export interface TourLabelItem {
  text: string
  duration: number
}

export interface OrbitalStats {
  magnitude: string
  velocity: string
  trueAnomaly: string
}

export interface DistanceResult {
  distance: number
  trueAnomaly: number
}

/** The actions an orbital's label needs, handed down to it by the orbital module. */
export type OrbitalLabelActions = Pick<
  Store,
  'setActiveOrbital' | 'addHighlightedOrbital' | 'removeHighlightedOrbital'
>
