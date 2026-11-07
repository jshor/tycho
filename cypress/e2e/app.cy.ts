import './app/firstVisit'
import './app/accessibility/desktop'
import './app/functionality/desktop'
import './app/accessibility/mobile'
import './app/accessibility/violations'
// these move the camera away from the sun so they go last
import './app/functionality/navigation'
import './app/accessibility/navigation'

before(() => cy.visitApp())
