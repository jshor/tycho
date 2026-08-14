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

/** How a comet body's tail is drawn, for the bodies that grow one. */
export interface TailData {
  /** How far the tail streams from the nucleus when fully grown, in scene units.  */
  length: number
  /** How wide the tail fans out at its far end, in scene units. */
  width: number
  /** The radius of the coma, as a multiple of the nucleus' visible radius. */
  comaScale: number
  /**Distance to the sun from the body to show its full tail, in scene units. */
  activeDistance: number
  /**
   * Percentage of the comet tail too extend to the point where it's too cold to vent [0 to 1]. */
  restActivity: number
  /** Color of the dust the nucleus sheds, which fans out around the tail. */
  dustColor: number
  /** Color of the ionised gas the solar wind blows straight back. */
  ionColor: number
}

export type Ephemeris = {
  /** Orbital code. See Wiki for list of codes. */
  nasaOrbitalCode: string
  /** Barycenter code. See Wiki for list of codes. */
  nasaBarycenterCode: string
  /** Revolution order (e.g., `m`, `h`, `d`, etc.) */
  revolutionOrder: string
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
  /** The color that atmosphere scatters the sunlight into, as CSS hex (e.g. `#5DA9E9`). */
  atmosphereColor?: string
  /** The texture of the cloud deck drawn over the body. */
  clouds?: string
  isSatellite?: boolean
  periapses: Periapses
  satellites?: OrbitalData[]
  satelliteIds?: string[]
  maps?: TextureMap[]
  rings?: RingData
  tail?: TailData
  description?: string
  /** NASA ephemeris data for the body. */
  ephemeris?: Ephemeris
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

export interface Store {
  /** Whether or not the simulation is currently playing. */
  playing?: boolean
  /** The current simulation time, in seconds. */
  time?: number
  /** The orbital data for the Solar System. */
  orbitalData?: OrbitalData[]
  /** The translated page text for the app. */
  pageText?: PageText
  /** Time the user last interacted with the scene. */
  interacted?: number
  /** The ID of the orbital the camera is focused on. */
  targetId?: string
  /** The ID of the orbital whose path+label are highlighted. */
  highlightedId?: string
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
  /** Whether or not the scene is currently idle. */
  isIdle?: boolean
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
  /** Width of the modal in pixels (0 if not open). */
  modalWidth?: number
  /** The volume of the scene's ambience [0, 1]. */
  volume?: number
  /** The currently-focused target orbital. */
  target?: OrbitalData

  /** Fetches the orbital data for the Solar System. */
  requestOrbitalData: () => Promise<void>
  /** Fetches the translated page text for the app. */
  requestPageText: () => Promise<void>
  /** Focuses the camera on the given orbital. */
  setActiveOrbitalId: (targetId: string, animateTargetChange?: boolean) => void
  /** Highlights the given orbital's path (or null to un-highlight). */
  setHighlightedId: (id?: string) => void
  /** Records how far through loading its assets the scene is. */
  setPercentLoaded: (count: number, total: number) => void
  /** Applies a new zoom level. */
  changeZoom: (zoom: number) => void
  /** Records the moment the user interacted with the scene. */
  recordInteraction: () => void
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
