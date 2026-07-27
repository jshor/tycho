// Shared TypeScript interfaces for the Tycho application

export interface Vector3Like {
  x: number
  y: number
  z: number
}

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
  scale?: number
}

export interface OrbitalData {
  id: string
  name: string
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
  settings?: string
  speedScale?: string
  planetScale?: string
  skipTour?: string
  stats?: StatsPageText
  abbreviations?: AbbreviationsPageText
}

// Redux state slices

export interface AnimationState {
  playing?: boolean
  time?: number
}

export interface DataState {
  orbitalData?: OrbitalData[]
  pageText?: PageText
}

export interface EventState {
  touched?: number
  released?: number
}

export interface LabelState {
  targetId?: string
  targetName?: string
  animateTargetChange?: boolean
  labelText?: string
  highlightedOrbitals?: string[]
}

export interface LoaderState {
  percent?: number
  url?: string
}

export interface TourState {
  isAutoOrbitEnabled?: boolean
  isComplete?: boolean
}

export interface UIControlsState {
  zoom?: number
  scale?: number
  speed?: number
  timeOffset?: number
  controlsEnabled?: boolean
  activeModal?: string | null
  settingsActive?: boolean
  volume?: number
  newVector?: Vector3Like
}

export interface RootState {
  animation: AnimationState
  data: DataState
  event: EventState
  label: LabelState
  loader: LoaderState
  tour: TourState
  uiControls: UIControlsState
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

// Action shape used by ReduxService
export interface ReduxAction {
  type: string
  [key: string]: unknown
}

export interface BoundActions {
  setCameraOrbit: (isAutoOrbitEnabled: boolean) => void
  tourCompleted: (isComplete: boolean) => void
  requestOrbitalData: () => void
  requestPageText: () => void
  setTime: (time: number) => void
  setPlaying: (playing: boolean) => void
  setTouched: (touched: number) => void
  setReleased: (released: number) => void
  changeZoom: (zoom: number) => void
  changeSpeed: (speed: number) => void
  changeScale: (scale: number) => void
  changeTimeOffset: (timeOffset: number) => void
  setUIControls: (controlsEnabled: boolean) => void
  toggleModal: (activeModal: string | null) => void
  toggleSettings: (settingsActive: boolean) => void
  setVolume: (volume: number) => void
  setPercentLoaded: (count: number, total: number) => void
  setTextureLoaded: (url: string) => void
  setActiveOrbital: (targetId: string, targetName: string, animateTargetChange?: boolean) => void
  setLabelText: (labelText: string) => void
  addHighlightedOrbital: (highlightedOrbital: string) => void
  removeHighlightedOrbital: (highlightedOrbital: string) => void
}

/** The actions an orbital's label needs, threaded down through Scene and Orbital. */
export type OrbitalLabelActions = Pick<
  BoundActions,
  'setActiveOrbital' | 'addHighlightedOrbital' | 'removeHighlightedOrbital'
>
