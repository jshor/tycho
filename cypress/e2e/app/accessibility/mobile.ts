import { ORIENTATIONS } from '../../../support/constants'

describe('accessibility (mobile)', () => {
  it('should let the page be zoomed, as the viewport no longer forbids it (WCAG 1.4.4)', () => {
    cy.get('meta[name="viewport"]')
      .invoke('attr', 'content')
      .should('not.match', /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\D|$)/)
  })

  ORIENTATIONS.forEach(({ name, width, height }) => {
    describe(name, () => {
      beforeEach(() => {
        cy.viewport(width, height)
        // the zoom slider moves its thumb a moment after the screen changes size
        cy.get('[role="slider"][aria-label="Zoom"]').should(($thumb) => {
          const thumb = $thumb[0].getBoundingClientRect()
          const track = $thumb[0].parentElement.getBoundingClientRect()

          expect(thumb.top, 'zoom thumb top').to.be.at.least(track.top - thumb.height)
          expect(thumb.bottom, 'zoom thumb bottom').to.be.at.most(track.bottom + thumb.height)
        })
      })

      it('should pass axe (target sizes included), and have a button for every drawn label', () => {
        cy.labelsDrawn(1)
        cy.checkPage()
        cy.checkLabels()
      })

      it('should fit every control on the screen, without scrolling sideways (WCAG 1.4.10)', () => {
        cy.window().then((win) => {
          win.scrollTo(width, 0)
          expect(win.scrollX, 'sideways scroll').to.equal(0)
        })
        cy.get('#controls')
          .find('button, [role="slider"]')
          .not('.speed-control__popover *')
          .should(($controls) => {
            $controls.each((_, control) => {
              const { left, right, top, bottom } = control.getBoundingClientRect()
              const name = control.getAttribute('aria-label') ?? control.textContent

              expect(left, `${name} left edge`).to.be.at.least(0)
              expect(right, `${name} right edge`).to.be.at.most(width)
              expect(top, `${name} top edge`).to.be.at.least(0)
              expect(bottom, `${name} bottom edge`).to.be.at.most(height)
            })
          })
      })
    })
  })
})
