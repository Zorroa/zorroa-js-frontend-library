require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until } = selenium.webdriver

const DEBUG = true

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
    driver.then(_ => { DEBUG && console.log('user should be able to log in') })
    selenium.login()

    driver.then(_ => { DEBUG && console.log('Make sure Workspace, header, Assets are visible') })
    selenium.expectCssElementIsVisible('.header')
    selenium.expectCssElementIsVisible('.Workspace')
    selenium.expectCssElementIsVisible('.Assets')

    driver.then(_ => { DEBUG && console.log('Wait for the default server query to return, and start displaying assets') })
    driver.wait(until.elementLocated(By.css('.assets-footer')), 15000)
    selenium.expectCssElementIsVisible('.assets-footer')

    return driver
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('test the Table', function () {
    driver.then(_ => { DEBUG && console.log('test the Table') })

    var TableToggle
    var assetsScrollHeight
    var expectedMinAssetsScrollHeight = '62px' // see Assets.js:footerEditbarAndPaddingHeight
    var expectedMinTableHeight = '26px' // see Assets.js:minTableHeight
    var elements

    const dragVertFn = (fromEleName, toEleName, yoffset) => {
      var n = Math.abs(yoffset / 50)
      var dy = yoffset / n

      driver.then(_ => { DEBUG && console.log({n, dy, yoffset}) })
      var prom = driver
      .then(_ => driver.actions().mouseDown(elements[fromEleName]).perform())
      .then(_ => selenium.showLog())

      // Dummy mouse move events make the remote Sauce runs more stable
      // .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      // .then(_ => selenium.showLog())
      .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      .then(_ => selenium.showLog())

      .then(_ => selenium.waitForJsFnVal('window.zorroa.getTableIsResizing', true, 10000))
      .then(_ => selenium.showLog())

      for (let i = 0; i < n; i++) {
        // prom = prom.then(_ => DEBUG && console.log({x: 0, y: dy}))
        prom = prom.then(_ => driver.actions().mouseMove({x: 0, y: dy}).perform())
        // prom = prom.then(_ => selenium.showLog())
      }

      prom = prom.then(_ => selenium.showLog())

      prom = prom
      .then(_ => driver.actions().mouseMove({x: 0, y: 0}).perform())
      .then(_ => selenium.showLog())
      .then(_ => driver.actions().mouseUp().perform())
      .then(_ => selenium.showLog())
      .then(_ => selenium.waitForJsFnVal('window.zorroa.getTableIsResizing', false, 10000))
      .then(_ => selenium.showLog())

      return prom
    }

    driver.then(_ => { DEBUG && console.log('Wait for the footer (done above, but do it again to reduce deps, allow test-only, etc.)') })
    driver.then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))

    driver.then(_ => { DEBUG && console.log('Table shouldnt be visible initially') })
    driver.then(_ => selenium.expectCssElementIsNotVisible('.Table'))

    driver.then(_ => { DEBUG && console.log('Open the Table') })
    driver.then(_ => driver.findElement(By.css('.TableToggle')))
      .then(ele => { TableToggle = ele })
    driver.then(_ => TableToggle.click())
    driver.then(_ => selenium.expectCssElementIsVisible('.Table'))

    driver.then(_ => selenium.findCssElements(['.Table', '.header', '.assets-footer', '.assets-scroll', '.Assets-tableResize']))
      .then(eles => { elements = eles })

    driver.then(_ => { DEBUG && console.log('Check the height of assets-scroll before we resize the Table') })
    driver.then(_ => elements['.assets-scroll'].getCssValue('height'))
      .then(height => { assetsScrollHeight = height })

    driver.then(_ => { DEBUG && console.log('Expand the Table as far as it will go') })
    driver.then(_ => dragVertFn('.Assets-tableResize', '.header', -2000))

    driver.then(_ => { DEBUG && console.log('Check that the table size changed, and that the assets scroll is at the expected minimum') })
    driver.then(_ => elements['.assets-scroll'].getCssValue('height'))
      .then(height => {
        expect(height).not.toBe(assetsScrollHeight)
        expect(height).toBe(expectedMinAssetsScrollHeight)
      })

    driver.then(_ => { DEBUG && console.log('Shrink the Table as far as it will go') })
    driver.then(_ => dragVertFn('.Assets-tableResize', '.assets-footer', 2000))

    driver.then(_ => { DEBUG && console.log('Check that the Table height is at the expected minimum') })
    driver.then(_ => elements['.Table'].getCssValue('height'))
      .then(height => expect(height).toBe(expectedMinTableHeight))

    driver.then(_ => { DEBUG && console.log('Close the Table') })
    driver.then(_ => TableToggle.click())
    driver.then(_ => selenium.expectCssElementIsNotVisible('.Table'))

    return driver
  })
})
