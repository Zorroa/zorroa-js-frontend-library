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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check lightbox', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check basic lightbox layout') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Thumb'), 15000))
    .then(_ => driver.findElement(By.css('.Thumb'))
      .then(ele => driver.actions().doubleClick(ele).perform()))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.lightbox')))

    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Lightbar')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Lightbar-settings')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Lightbar-close')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Controlbar')))

    .then(_ => selenium.expectSelectorEnabledToBe(false, By.css('.Controlbar-zoom-reset')))
    .then(_ => selenium.clickSelector(By.css('.Controlbar-zoom-in')))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.Controlbar-zoom-reset')))
    .then(_ => selenium.clickSelector(By.css('.Controlbar-zoom-reset')))
    .then(_ => selenium.waitForSelectorEnabledToBe(false, By.css('.Controlbar-zoom-reset')))
    .then(_ => selenium.clickSelector(By.css('.Controlbar-zoom-out')))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.Controlbar-zoom-reset')))
  })

})
