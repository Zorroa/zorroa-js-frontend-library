require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until } = selenium.webdriver

const DEBUG = false

describe('Table', function () {
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

  it('user should be able to log in', function () {
    DEBUG && console.log('user should be able to log in')
    return selenium.login(driver)

    // Make sure Workspace, header, Assets are visible
    .then(_ => selenium.expectCssElementIsVisible(driver, '.header'))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.Workspace'))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.Assets'))

    // Wait for the default server query to return, and start displaying assets
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.assets-footer'))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('test the Table', function () {
    DEBUG && console.log('test the Table')

    var TableToggle
    var assetsScrollHeight
    var expectedMinAssetsScrollHeight = '110px' // see Assets.js:footerEditbarAndPaddingHeight
    var expectedMinTableHeight = '26px' // see Assets.js:minTableHeight
    var elements

    const dragVertFn = (fromEleName, toEleName, yoffset) => {
      var n = Math.abs(yoffset / 100)
      var dy = yoffset / n

      DEBUG && console.log({n, dy, yoffset})
      var prom = driver
      .then(_ => driver.actions().mouseDown(elements[fromEleName]).perform())
      .then(_ => selenium.showLog(driver))

      // Dummy mouse move events make the remote Sauce runs more stable
      // .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      // .then(_ => selenium.showLog(driver))
      .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      .then(_ => selenium.showLog(driver))

      .then(_ => selenium.waitForJsFnVal(driver, 'window.zorroa.getTableIsResizing', true, 10000))
      .then(_ => selenium.showLog(driver))

      for (let i = 0; i < n; i++) {
        // prom = prom.then(_ => DEBUG && console.log({x: 0, y: dy}))
        prom = prom.then(_ => driver.actions().mouseMove({x: 0, y: dy}).perform())
        // prom = prom.then(_ => selenium.showLog(driver))
      }

      prom = prom.then(_ => selenium.showLog(driver))

      prom = prom
      .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      .then(_ => selenium.showLog(driver))
      .then(_ => driver.actions().mouseUp().perform())
      .then(_ => selenium.showLog(driver))
      .then(_ => selenium.waitForJsFnVal(driver, 'window.zorroa.getTableIsResizing', false, 10000))
      .then(_ => selenium.showLog(driver))

      return prom
    }

    return driver

    // Wait for the footer (done above, but do it again to reduce deps, allow test-only, etc.)
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))

    // Table shouldn't be visible initially
    .then(_ => selenium.expectCssElementIsNotVisible(driver, '.Table'))

    // Open the Table
    .then(_ => driver.findElement(By.css('.TableToggle')))
    .then(ele => { TableToggle = ele })
    .then(_ => TableToggle.click())
    .then(_ => selenium.expectCssElementIsVisible(driver, '.Table'))

    .then(_ => selenium.findCssElements(['.Table', '.header', '.assets-footer', '.assets-scroll', '.Assets-tableResize']))
    .then(eles => { elements = eles })

    // Check the height of assets-scroll before we resize the Table
    .then(_ => elements['.assets-scroll'].getCssValue('height'))
    .then(height => { assetsScrollHeight = height })

    // Expand the Table as far as it will go
    .then(_ => dragVertFn('.Assets-tableResize', '.header', -450))

    // Check that the table size changed, and that the assets scroll is at the expected minimum
    .then(_ => elements['.assets-scroll'].getCssValue('height'))
    .then(height => {
      expect(height).not.toBe(assetsScrollHeight)
      expect(height).toBe(expectedMinAssetsScrollHeight)
    })

    // Shrink the Table as far as it will go
    .then(_ => dragVertFn('.Assets-tableResize', '.assets-footer', 450))

    // Check that the Table height is at the expected minimum
    .then(_ => elements['.Table'].getCssValue('height'))
    .then(height => expect(height).toBe(expectedMinTableHeight))

    // Close the Table
    .then(_ => TableToggle.click())
    .then(_ => selenium.expectCssElementIsNotVisible(driver, '.Table'))
  })
})
