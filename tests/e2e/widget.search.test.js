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

  // afterEach(function () {
  // })

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
    .then(_ => selenium.waitForCssElementVisible('.assets-footer', 15000))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check search widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check search widget') })

    .then(_ => selenium.clickCssElement('.Sidebar-open-close-button.isRightEdge'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty', 5000))
    .then(_ => selenium.clickCssElement('.Racetrack-add-widget'))
    .then(_ => selenium.waitForCssElementVisible('.modal .AddWidget', 5000))
    .then(_ => selenium.clickCssElement('.widget-SIMPLE_SEARCH'))
    .then(_ => selenium.waitForCssElementVisible('.modal .DisplayOptions', 5000))
    .then(_ => selenium.expectCssElementHasClass('.DisplayOptions-update', 'disabled'))
    .then(_ => selenium.clickCssElement('.DisplayOptions-namespace-Disney'))
    .then(_ => selenium.waitForCssElementVisible('.DisplayOptions-namespace-Disney-animators', 5000))
    .then(_ => selenium.clickCssElement('.DisplayOptions-namespace-Disney-animators input'))
    .then(_ => selenium.waitForCssElementToNotHaveClass('.DisplayOptions-update', 'disabled', 5000))
    .then(_ => selenium.waitForCssElementEnabled('.DisplayOptions-update'))
    .then(_ => selenium.clickCssElement('.DisplayOptions-update'))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-filters .SimpleSearch', 5000))

    .then(_ => { DEBUG && console.log('Expect 39 images by Ferguson exact') })
    .then(_ => selenium.waitForElementVisibleToBe(By.css, '.SimpleSearch-fuzzy', true))
    .then(_ => selenium.clickCssElement('.SimpleSearch input'))
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Ferguson', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForCssElementVisible('.asset-counter-count'))
    .then(_ => driver.findElement(By.css('.asset-counter-count')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('39'))

    .then(_ => { DEBUG && console.log('Expect 39 images by Farguson fuzzy') })
    .then(_ => selenium.clickCssElement('.SimpleSearch input'))
    .then(_ => driver.findElement(By.css('.SimpleSearch input'))).then(ele => ele.clear())
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Farguson', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForCssElementVisible('.asset-counter-count'))
    .then(_ => driver.findElement(By.css('.asset-counter-count')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('39'))

    .then(_ => selenium.clickCssElement('.SimpleSearch .Toggle'))
    .then(selenium.waitForIdle)

    .then(_ => { DEBUG && console.log('Expect 0 images by Buhler fuzzy') })
    .then(_ => selenium.clickCssElement('.SimpleSearch input'))
    .then(_ => driver.findElement(By.css('.SimpleSearch input'))).then(ele => ele.clear())
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Buhler', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForCssElementNotVisible('.assets-footer'))


  })

})
