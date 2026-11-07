import { getOverlappingLabels, TychoWindow } from '../../../support/audits'

/** The draw order of a hovered or focused label. See `LABEL_RENDER_ORDER` in the app. */
const RAISED = 1000000

const repairs: (() => void)[] = []
const repair = () => {
  repairs
    .splice(0)
    .reverse()
    .forEach((undo) => undo())
}

/**
 * Sets (or if given `null` removes) an attribute of the matching elements.
 */
const setAttr = (selector: string, name: string, value: string | null) =>
  cy.get(selector).then(($elements) => {
    $elements.each((_, element) => {
      const previous = element.getAttribute(name)
      const apply = (to: string | null) =>
        to === null ? element.removeAttribute(name) : element.setAttribute(name, to)

      apply(value)
      repairs.push(() => apply(previous))
    })
  })

/**
 * Styles the matching elements inline.
 */
const setStyle = (selector: string, style: Partial<CSSStyleDeclaration>) =>
  cy.get(selector).then(($elements) => {
    $elements.each((_, element) => {
      const previous = element.getAttribute('style')

      Object.assign(element.style, style)
      repairs.push(() =>
        previous === null
          ? element.removeAttribute('style')
          : element.setAttribute('style', previous)
      )
    })
  })

const axeRules = () => cy.axeViolations().then((violations) => violations.map(({ id }) => id))
const drawnLabel = () =>
  cy.window().then((win: TychoWindow) => [...win.__TYCHO_LABELS__].find(([, p]) => p.visible)[0])

describe('accessibility violations', () => {
  afterEach(repair)

  describe('axe', () => {
    it('should report a control stripped of its name (button-name)', () => {
      setAttr('#controls button:contains("About") .sr-only', 'aria-hidden', 'true')

      axeRules().should('include', 'button-name')
    })

    it('should report a control named apart from the text it shows (label-content-name-mismatch)', () => {
      setAttr('#target-label', 'aria-label', 'Open stats')

      axeRules().should('include', 'label-content-name-mismatch')
    })

    it('should report focusable labels hidden from assistive technology (aria-hidden-focus)', () => {
      drawnLabel().then((id) => cy.get(`[data-orbital-id="${id}"]`).focus())
      setAttr('nav[aria-label="Orbitals"]', 'aria-hidden', 'true')

      axeRules().should('include', 'aria-hidden-focus')
    })

    it('should report a page that forbids zooming (meta-viewport)', () => {
      setAttr(
        'meta[name="viewport"]',
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      )

      axeRules().should('include', 'meta-viewport')
    })

    it('should report the days of the calendar drawn too dim to read (color-contrast)', () => {
      cy.get('.date-picker__display').focus().realPress('Enter')

      setStyle('.react-datepicker__day', { color: '#1e1e1e' })
      axeRules().should('include', 'color-contrast')

      cy.realPress('Escape')
      cy.get('.react-datepicker').should('not.exist')
    })

    it('should report controls too small to hit, crowded together (target-size)', () => {
      setStyle('.ui-controls-layout__right', { gap: '0' })
      setStyle('.ui-controls-layout__right .control-button', {
        width: '10px',
        height: '10px',
        padding: '0'
      })

      axeRules().should('include', 'target-size')
    })

    it('should report content left outside of every landmark (region)', () => {
      cy.document().then((doc) => {
        const stray = doc.createElement('p')

        stray.textContent = 'Stray content'
        doc.body.appendChild(stray)
        repairs.push(() => stray.remove())
      })

      axeRules().should('include', 'region')
    })

    it('should report a slider without a name (aria-input-field-name)', () => {
      setAttr('[role="slider"][aria-label="Zoom"]', 'aria-label', null)

      axeRules().should('include', 'aria-input-field-name')
    })
  })

  describe('the labels', () => {
    it('should report a drawn label that has no button', () => {
      drawnLabel().then((id) => setAttr(`[data-orbital-id="${id}"]`, 'data-orbital-id', 'gone'))

      cy.expectLabelProblem('drawn without a button')
    })

    it('should report a button that is away from its label', () => {
      drawnLabel().then((id) =>
        setStyle(`li.labels__item:has([data-orbital-id="${id}"])`, {
          transform: 'translateX(100px)'
        })
      )

      cy.expectLabelProblem('button is not over its label')
    })

    it('should report a reachable button whose label is not drawn', () => {
      cy.window()
        .its('__TYCHO_STORE__')
        .invoke('getState')
        .its('targetId')
        .then((id) =>
          setStyle(`li.labels__item:has([data-orbital-id="${id}"])`, { display: 'block' })
        )

      cy.expectLabelProblem('button shown but not drawn')
    })

    it('should report a focused label left drawn beneath one it overlaps', () => {
      let beneath: string

      // a focused label is always drawn on top so move the focus off the labels first
      cy.get('#scene').focus()
      cy.window().should((win: TychoWindow) => {
        const labels = win.__TYCHO_LABELS__
        const order = (id: string) => labels.get(id).order
        // how much two labels overlap in square pixels
        const area = ([a, b]: string[]) => {
          const [p, q] = [labels.get(a), labels.get(b)]
          const width = Math.min(p.left + p.width, q.left + q.width) - Math.max(p.left, q.left)
          const height = Math.min(p.top + p.height, q.top + q.height) - Math.max(p.top, q.top)

          return width * height
        }
        // the pair that overlaps the most so a slight drift of the camera cannot part them
        const [pair] = getOverlappingLabels(win)
          .filter((ids) => ids.every((id) => order(id) < RAISED))
          .sort((a, b) => area(b) - area(a))

        expect(pair && area(pair), 'overlap of two labels that are not raised').to.be.above(200)
        beneath = order(pair[0]) < order(pair[1]) ? pair[0] : pair[1]
      })

      cy.then(() => cy.get(`[data-orbital-id="${beneath}"]`).focus())
      cy.checkLabels()

      // as if the canvas never heard of the focus as it did not before the audit
      cy.window().then((win: TychoWindow) =>
        win.__TYCHO_STORE__.setState({ focusedLabelId: undefined })
      )
      cy.expectLabelProblem('focused but drawn under')
    })
  })

  describe('the modals', () => {
    beforeEach(() => {
      cy.contains('#controls button', 'About').focus().realPress('Enter')
      cy.focused().should('have.attr', 'aria-label', 'Close')
    })

    afterEach(() => {
      repair()
      cy.realPress('Escape')
      cy.get('[role="dialog"].modal--open').should('not.exist')
    })

    it('should report a modal without a title (aria-dialog-name)', () => {
      setAttr('[role="dialog"].modal--open', 'aria-labelledby', null)

      axeRules().should('include', 'aria-dialog-name')
    })
  })
})
