// Shared TypeScript interfaces for the Tycho application

export interface Periapses {
  last: number;
  next: number;
}

export interface TextureMap {
  url: string;
  slot?: string;
}

export interface RingData {
  outerRadius: number;
  barycenterTilt: number;
  maps: TextureMap[];
  scale?: number;
}

export interface OrbitalData {
  id: string;
  name: string;
  radius: number;
  semimajor: number;
  semiminor: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  argumentOfPeriapsis: number;
  axialTilt: number;
  sidereal: number;
  centralMass: number;
  atmosphere?: number;
  isSatellite?: boolean;
  periapses: Periapses;
  satellites?: OrbitalData[];
  maps?: TextureMap[];
  rings?: RingData;
  description?: string;
}

export interface WebGLPageText {
  noWebGl: string;
  required: string;
  enableInstructionsUrl: string;
  clickHere: string;
  learn: string;
}

export interface StatsPageText {
  currentEarthTime: string;
  velocityAtVector: string;
  distanceToSun: string;
  trueAnomaly: string;
}

export interface AbbreviationsPageText {
  kilometers: string;
  seconds: string;
  theta: string;
}

export interface PageText {
  aboutTitle?: string;
  aboutInfo?: string;
  webgl?: WebGLPageText;
  start?: string;
  settings?: string;
  speedScale?: string;
  planetScale?: string;
  skipTour?: string;
  stats?: StatsPageText;
  abbreviations?: AbbreviationsPageText;
}

// Redux state slices

export interface AnimationState {
  playing?: boolean;
  time?: number;
}

export interface DataState {
  orbitalData?: OrbitalData[];
  pageText?: PageText;
}

export interface EventState {
  touched?: number;
  released?: number;
}

export interface LabelState {
  targetId?: string;
  targetName?: string;
  labelText?: string;
  highlightedOrbitals?: string[];
}

export interface LoaderState {
  percent?: number;
  url?: string;
}

export interface TourState {
  isAutoOrbitEnabled?: boolean;
  isComplete?: boolean;
  isSkipped?: boolean;
}

export interface UIControlsState {
  zoom?: number;
  scale?: number;
  speed?: number;
  timeOffset?: number;
  controlsEnabled?: boolean;
  activeModal?: string | null;
  settingsActive?: boolean;
  volume?: number;
  newVector?: any;
}

export interface RootState {
  animation: AnimationState;
  data: DataState;
  event: EventState;
  label: LabelState;
  loader: LoaderState;
  tour: TourState;
  uiControls: UIControlsState;
}

export interface TourLabelItem {
  text: string;
  duration: number;
}

export interface OrbitalStats {
  magnitude: string;
  velocity: string;
  trueAnomaly: string;
}

export interface DistanceResult {
  distance: number;
  trueAnomaly: number;
}

// Action shape used by ReduxService
export interface ReduxAction {
  type: string;
  [key: string]: any;
}
