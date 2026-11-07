import { getDrawnLabels, TychoWindow } from '../../../support/audits'

const state = (key: string) => cy.window().its('__TYCHO_STORE__').invoke('getState').its(key)

const labelSpots = (win: TychoWindow) =>
  JSON.stringify(
    [...win.__TYCHO_LABELS__.values()].map((p) => [Math.round(p.left), Math.round(p.top)])
  )

describe('accessibility (desktop)', () => {
  describe('the scene', () => {
    it('should pass axe, have a single h1, and have a button for every drawn label', () => {
      cy.labelsDrawn()
      cy.get('main h1').should('have.length', 1).and('contain.text', 'Tycho')
      cy.checkPage()
      cy.checkLabels()
    })

    it('should be named after the orbital in view, and read out how to operate it', () => {
      state('targetName').then((name) => {
        cy.get('#scene')
          .should('have.attr', 'role', 'application')
          .and('have.attr', 'aria-label', `Solar system, viewing ${name}`)
          .invoke('attr', 'aria-describedby')
          .then((id) => cy.get(`[id="${id}"]`).should('contain.text', 'arrow keys'))
      })
    })

    it('should turn the camera with the arrow keys, the labels in step with it', () => {
      cy.window().then((win: TychoWindow) => {
        const before = labelSpots(win)

        cy.get('#scene').focus()
        cy.realPress('ArrowLeft')
        cy.window().should((after: TychoWindow) => expect(labelSpots(after)).not.to.equal(before))
      })
      cy.checkLabels()
    })

    it('should leave the pointer to the canvas, which draws (and so hit-tests) the labels', () => {
      cy.window().then((win: TychoWindow) => {
        const [, { left, top, width, height }] = [...getDrawnLabels(win)][0]
        const hit = win.document.elementFromPoint(left + width / 2, top + height / 2)

        expect(hit?.tagName, 'what the pointer lands on').to.equal('CANVAS')
      })
    })
  })

  describe('the labels', () => {
    it('should raise the label holding the focus, and highlight its path, as hovering does', () => {
      cy.window().then((win: TychoWindow) => {
        const [id] = [...getDrawnLabels(win)][0]

        cy.get(`[data-orbital-id="${id}"]`).focus()
        state('focusedLabelId').should('equal', id)
        state('highlightedId').should('equal', id)
        cy.checkLabels()
      })
    })

    it('should draw each overlapping label over the rest while it holds the focus', () => {
      // the inner planets crowd around the sun, seen from as far out as the camera goes
      cy.overlappingLabels().then((pairs) => {
        expect(pairs.length, 'overlapping labels').to.be.at.least(1)

        pairs[0].forEach((id) => {
          cy.get(`[data-orbital-id="${id}"]`).focus()
          cy.checkLabels()
        })
      })
    })
  })

  describe('the controls', () => {
    it('should name every control after what it does', () => {
      cy.contains('#controls button', 'About')
      cy.get('#controls [role="slider"][aria-label="Zoom"]')
      cy.get('#controls button[aria-label="Sound"]')
      state('targetName').then((name) => {
        cy.get('#target-label')
          .should('contain.text', name)
          .and('have.attr', 'aria-haspopup', 'dialog')
      })
      // each button reads out its name after the glyph it shows
      cy.contains('#controls button', /(Play|Pause)$/)
      cy.contains('#controls button', /Speed: .*× real time/)
      cy.get('.date-picker__display')
        .invoke('attr', 'aria-describedby')
        .then((id) => cy.get(`[id="${id}"]`).should('have.text', 'Change the date and time'))
    })

    it('should toggle the sound, and report whether it is on', () => {
      cy.get('button[aria-label="Sound"]').then(($sound) => {
        const wasOn = $sound.attr('aria-pressed')

        cy.wrap($sound).focus().realPress('Enter')
        cy.get('button[aria-label="Sound"]').should(
          'have.attr',
          'aria-pressed',
          wasOn === 'true' ? 'false' : 'true'
        )

        // and back again, as it was
        cy.realPress('Enter')
        cy.get('button[aria-label="Sound"]').should('have.attr', 'aria-pressed', wasOn)
      })
    })

    it('should play and pause, naming the action the button takes', () => {
      cy.contains('#controls button', 'Pause').focus().realPress('Space')
      cy.contains('#controls button', 'Play').should('have.focus')

      // and on again, as the rest of the run expects the simulation to be running
      cy.realPress('Space')
      cy.contains('#controls button', 'Pause').should('have.focus')
    })

    it('should zoom from the keyboard by a step that can be felt', () => {
      cy.get('[role="slider"][aria-label="Zoom"]').focus().realPress('End')
      cy.get('[role="slider"][aria-label="Zoom"]')
        .invoke('attr', 'aria-valuenow')
        .then((before) => {
          cy.realPress('ArrowDown')
          cy.get('[role="slider"][aria-label="Zoom"]')
            .should('have.attr', 'aria-valuenow', String(Number(before) - 5))
            .and('have.attr', 'aria-valuetext', `${Number(before) - 5}% zoomed out`)
        })

      // and back out, to see the whole of the solar system again
      cy.realPress('End')
    })

    it('should open the speed slider, focus it, and let escape put it away again', () => {
      cy.get('button[aria-controls]').as('speed').should('have.attr', 'aria-expanded', 'false')
      cy.get('@speed').focus().realPress('Enter')

      cy.get('@speed').should('have.attr', 'aria-expanded', 'true')
      cy.focused()
        .should('have.attr', 'role', 'slider')
        .and('have.attr', 'aria-label', 'Speed')
        .and('have.attr', 'aria-valuetext', '1× real time')

      cy.realPress('ArrowRight')
      cy.focused().should('have.attr', 'aria-valuetext', '10× real time')
      cy.get('@speed').should('contain.text', 'Speed: 10× real time')

      // and back to real time, so that the planets hold (nearly) still for the rest of the run
      cy.realPress('ArrowLeft')
      cy.realPress('Escape')
      cy.get('@speed').should('have.focus').and('have.attr', 'aria-expanded', 'false')
    })

    it('should open the calendar from the keyboard, and pass axe while open', () => {
      cy.get('.date-picker__display').focus().realPress('Enter')
      cy.get('.react-datepicker').should('be.visible')
      cy.checkPage()

      cy.realPress('Escape')
      cy.get('.react-datepicker').should('not.exist')
      cy.get('.date-picker__display').should('have.focus')
    })
  })

  describe('the modals', () => {
    it('should take the focus into the About modal, and keep the page behind it out of reach', () => {
      cy.contains('#controls button', 'About').focus().realPress('Enter')

      cy.get('[role="dialog"].modal--open h2').should('contain.text', 'About')
      cy.focused().should('have.attr', 'aria-label', 'Close')
      cy.get('#scene').closest('[inert]').should('exist')
      cy.checkPage()
    })

    it('should close on escape, handing the focus back to what opened it', () => {
      cy.realPress('Escape')
      cy.contains('#controls button', 'About').should('have.focus')
    })

    it('should read out the stats of the target as pairs, and close from its close button', () => {
      cy.get('#target-label').focus().realPress('Enter')
      cy.get('.stats dl dt').should('have.length', 4)
      cy.get('.stats dl dt').first().next().should('match', 'dd')
      cy.get('#scene').closest('[inert]').should('exist')

      cy.focused().should('have.attr', 'aria-label', 'Close').realPress('Enter')
      cy.get('#target-label').should('have.focus')
    })
  })
})
