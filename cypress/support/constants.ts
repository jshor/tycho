/** The standards every page state is held to (WCAG 2.2 A and AA, and axe's best practices). */
export const AXE_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
  'best-practice'
]

/** Violations axe reports that are not the app's to fix, by rule. */
export const KNOWN_EXCEPTIONS: Record<string, string[]> = {
  'label-content-name-mismatch': ['.react-datepicker__day'],
  'target-size': ['[data-orbital-id]']
}

/** Rules whose "needs review" results count as violations. */
export const STRICT_RULES = ['aria-hidden-focus', 'target-size']

/** The phone sizes the app is audited at, upright and turned on its side (WCAG 1.3.4). */
export const ORIENTATIONS = [
  { name: 'portrait', width: 375, height: 812 },
  { name: 'landscape', width: 812, height: 375 }
]
