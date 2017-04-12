require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until, Key } = selenium.webdriver

const DEBUG = true

describe('Workspace', function () {
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

  it('check lightbox', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check basic lightbox layout') })
    .then(_ => selenium.waitForCssElementVisible('.Thumb', 15000))
    .then(_ => driver.findElement(By.css('.Thumb'))
      .then(ele => driver.actions().doubleClick(ele).perform()))
    .then(_ => selenium.waitForCssElementVisible('.lightbox'))

    .then(_ => selenium.expectCssElementIsVisible('.Lightbar'))
    .then(_ => selenium.expectCssElementIsVisible('.Lightbar-settings'))
    .then(_ => selenium.expectCssElementIsVisible('.Lightbar-close'))
    .then(_ => selenium.expectCssElementIsVisible('.Controlbar'))

    .then(_ => selenium.expectCssElementIsDisabled('.Controlbar-zoom-reset'))
    .then(_ => selenium.clickCssElement('.Controlbar-zoom-in'))
    .then(_ => selenium.waitForCssElementEnabled('.Controlbar-zoom-reset'))
    .then(_ => selenium.clickCssElement('.Controlbar-zoom-reset'))
    .then(_ => selenium.waitForCssElementDisabled('.Controlbar-zoom-reset'))
    .then(_ => selenium.clickCssElement('.Controlbar-zoom-out'))
    .then(_ => selenium.waitForCssElementEnabled('.Controlbar-zoom-reset'))
  })

})
