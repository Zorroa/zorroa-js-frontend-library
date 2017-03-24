require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver

const DEBUG = false

describe('Collections', function () {
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
    return selenium.login(driver)

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForRequestSync(driver, 15000))
    .then(_ => selenium.waitForCssElementVisible(driver, '.assets-footer', 15000))
  })

  it('open collections panel, empty any trash', function () {
    return driver

    // Open the collections panel (TODO: check if already open)
    .then(_ => selenium.clickCssElement(driver, '.Collections'))
    .then(_ => selenium.waitForCssElementVisible(driver, '.Folders-controls', 15000))

    // If there's any trash, empty it now
    .then(_ => selenium.getCssElementVisible(driver, '.Collections .Trash'))
    .then(isVisible => {
      if (!isVisible) return

      return selenium.clickCssElement(driver, '.Collections .Trash-toggle')
      .then(_ => selenium.waitForCssElementVisible(driver, '.Collections .Trash-empty', 15000))
      .then(_ => selenium.clickCssElement(driver, '.Collections .Trash-empty'))
      .then(_ => selenium.waitForRequestSync(driver, 15000))
      .then(_ => selenium.waitForCssElementNotVisible(driver, '.Collections .Trash', 15000))
    })
  })
})
