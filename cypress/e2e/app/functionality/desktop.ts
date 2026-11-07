/** Returns part of the app state as it is now. */
const state = (key: string) => cy.window().its('__TYCHO_STORE__').invoke('getState').its(key)

/** The clock readout format. Spaces are non-breaking in the app. */
const READOUT = /^\d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2}$/

/**
 * The app working as it should. These tests carry on from the ones before them.
 */
describe('functionality (desktop)', () => {
  describe('the page', () => {
    it('should have its title', () => {
      cy.title().should('equal', 'Tycho.io – Solar System Simulator')
    })

    it('should remember that the tour was seen', () => {
      cy.window().its('localStorage').invoke('getItem', 'tourViewed').should('equal', 'true')
    })
  })

  describe('the orbitals', () => {
    it('should load every orbital with a label button for each', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = (orbitals: any[] = []): number =>
        orbitals.reduce((total, { satellites }) => total + 1 + count(satellites), 0)

      state('orbitalData').then((orbitals) => {
        expect(count(orbitals), 'orbitals').to.be.greaterThan(10)
        cy.get('[data-orbital-id]').should('have.length', count(orbitals))
      })
    })

    it('should name the orbital in view and not draw its label', () => {
      state('targetId').then((id) => {
        cy.get(`[data-orbital-id="${id}"]`).should('not.be.visible')
      })
      state('targetName').then((name) => cy.get('#target-label').should('contain.text', name))
    })
  })

  describe('the clock', () => {
    it('should run while the simulation plays', () => {
      state('playing').should('be.true')
      state('time').then((before) => state('time').should('be.greaterThan', before))
    })

    it('should show the time in the readout', () => {
      cy.get('.date-picker__display').should(($readout) => {
        expect($readout.text().replace(/ /g, ' ')).to.match(READOUT)
      })
    })

    it('should show the speed it runs at', () => {
      state('speed').then((speed) => {
        cy.get('.speed-control__exponent').should('have.text', String(speed))
      })
    })

    it('should stop while paused', () => {
      cy.contains('#controls button', 'Pause').click()
      state('playing').should('be.false')

      state('time').then((paused) => {
        cy.wait(1500)
        state('time').should('equal', paused)
      })

      cy.contains('#controls button', 'Play').click()
      state('playing').should('be.true')
    })

    it('should move to the date picked from the calendar', () => {
      // the offset is only set once a date is picked so it may not exist yet
      cy.window().then((win) => {
        const before = win.__TYCHO_STORE__.getState().timeOffset

        cy.get('.date-picker__display').click()
        cy.get('.react-datepicker__day--015:not(.react-datepicker__day--outside-month)').click()

        state('timeOffset').should('not.equal', before)
        cy.get('.date-picker__display').should('contain.text', '15')
      })

      cy.get('.date-picker__display').focus()
      cy.realPress('Escape')
      cy.get('.react-datepicker').should('not.exist')
    })
  })

  describe('the controls', () => {
    it('should show the zoom level on the slider', () => {
      state('zoom').then((zoom: number) => {
        cy.get('[role="slider"][aria-label="Zoom"]')
          .invoke('attr', 'aria-valuenow')
          .then(Number)
          .should('be.closeTo', zoom, 0.01)
      })
    })

    it('should mute the sound and remember it', () => {
      cy.get('button[aria-label="Sound"]').click()
      state('volume').should('equal', 0)
      cy.window().its('localStorage').invoke('getItem', 'volume').should('equal', '0')

      cy.get('button[aria-label="Sound"]').click()
      state('volume').should('equal', 1)
      cy.window().its('localStorage').invoke('getItem', 'volume').should('equal', '1')
    })
  })

  describe('the modals', () => {
    // close the modal even when a test fails so it does not block the tests after it
    afterEach(() => {
      cy.get('body').then(($body) => {
        if ($body.find('.modal--open').length) cy.realPress('Escape')
      })
      cy.get('.modal--open').should('not.exist')
    })

    it('should show the stats of the orbital in view', () => {
      cy.get('#target-label').click()

      state('targetName').then((name) => {
        cy.get('.modal--open h2').should('contain.text', name)
      })
      cy.get('.modal--open .stats__description').invoke('text').should('not.be.empty')
      cy.get('.modal--open .stats dd').then(($values) => {
        const [time, velocity, distance, anomaly] = [...$values].map((dd) => dd.textContent)

        expect(time.replace(/ /g, ' ')).to.match(READOUT)
        // a number or N/A for an orbital like the sun that orbits nothing
        const value = '(-?[\\d,]+\\.\\d{3}|N/A)'

        expect(velocity).to.match(new RegExp(`^${value}\\s+km/s$`))
        expect(distance).to.match(new RegExp(`^${value}\\s+km$`))
        expect(anomaly).to.match(new RegExp(`^${value}\\s+°$`))
      })
    })

    it('should show the about text with its links', () => {
      cy.contains('#controls button', 'About').click()

      cy.get('.modal--open h2').should('contain.text', 'About this project')
      cy.get('.modal--open a[href="https://github.com/jshor/tycho"]').should('exist')
    })
  })
})
