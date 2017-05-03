require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until, Key } = selenium.webdriver

const DEBUG = true

describe('search widget', function () {
  // For all jest functions that are passed a function parameter
  // (it, beforeEach, afterEach, beforeAll, afterAll):
  // if the passed function takes a callback, jest will wait for the callback to be called
  // if the passed function returns a promise, jest will wait for the promise to resolve

  const suite = this

  beforeAll(function (/* doneFn */) {
    driver = selenium.startBrowserAndDriver(suite)
    return driver
  })

  afterAll(function () {
    return selenium.stopBrowserAndDriver()
  })

  // beforeEach(function () {
  // })

  afterEach(function () {
    return selenium.expectNoJSErrors()
  })

  // Pay attention to where there are hidden promises
  // All driver actions turn into promises
  // And all driver actions wait for any previous unresolved promises
  // to complete before starting.

  // ----------------------------------------------------------------------
  // ----------------------------------------------------------------------

  it('user logs in', function () {
    DEBUG && console.log('user logs in')
    return driver.then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForIdle(15000))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check facet widget', function () {
    let text1, text2

    return driver
    .then(_ => { DEBUG && console.log('------ check facet widget') })

    .then(_ => selenium.clickSelector(By.css('.Sidebar-open-close-button.isRightEdge')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-empty'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-FACET'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-FACET')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-Disney-alignment'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney-alignment input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Facet'), 5000))

    .then(_ => { DEBUG && console.log('Expect Good and Bad') })
    // click on the first row
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Facet-value-table-row')))
    .then(_ => selenium.clickSelector(By.css('.Facet-value-table-row')))
    .then(selenium.waitForIdle)

    .then(_ => driver.findElement(By.css('.Facet-value-key')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('Good'))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => text1 = text)
    .then(_ => selenium.clickSelector(By.css('.Facet .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => text2 = text)
    .then(_ => {
      expect(Number(text2)).toBeGreaterThan(Number(text1))
    })

  })

})
