require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

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

  afterEach(function () {
    return selenium.expectNoJSErrors()
  })

  // Pay attention to where there are hidden promises
  // All driver actions turn into promises
  // And all driver actions wait for any previous unresolved promises
  // to complete before starting.

  // ----------------------------------------------------------------------
  // ----------------------------------------------------------------------

  it('user should be able to log in', function () {
    return driver.then(_ => { DEBUG && console.log('user should be able to log in') })
    .then(_ => selenium.login())

    .then(_ => { DEBUG && console.log('Make sure Workspace, header, Assets are visible') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Workspace')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Assets')))

    .then(_ => { DEBUG && console.log('Wait for the default server query to return, and start displaying assets') })
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.assets-footer')))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  function pageDown (by) {
    return driver.then(_ => {
      return driver.findElement(by)
        .then(ele => {
          return ele.getSize()
            .then(size => { return driver.actions().mouseMove(ele, {x: size.width - 5, y: size.height - 5}).click().sendKeys(Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN).perform() })
        })
    })
      .then(_ => driver.sleep(100))
  }

  it('test the Table', function () {
    var TableToggle
    var assetsScrollHeight
    var expectedMinAssetsScrollHeight = '174.797px' // see Assets.js:footerEditbarAndPaddingHeight
    var expectedMinTableHeight = '26px' // see Assets.js:minTableHeight
    var elements

    const dragVertFn = (fromEleName, toEleName, yoffset) => {
      const stepSize = 25
      const numSteps = Math.abs(yoffset / stepSize)
      const dy = yoffset / numSteps

      driver.then(_ => { DEBUG && console.log({numSteps, dy, yoffset}) })
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

      for (let i = 0; i < numSteps; i++) {
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

    return driver
    .then(_ => { DEBUG && console.log('test the Table') })
    .then(_ => { DEBUG && console.log('Wait for the footer (done above, but do it again to reduce deps, allow test-only, etc.)') })
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))

    .then(_ => { DEBUG && console.log('Table shouldnt be visible initially') })
    .then(_ => selenium.expectSelectorVisibleToBe(false, By.css('.Table')))

      .then(_ => { DEBUG && console.log('admin menu preferences') })
      .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-user')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 1') })
      .then(_ => selenium.clickSelector(By.css('.header-menu-user')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 2') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header-menu-prefs')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 3') })
      .then(_ => selenium.clickSelector(By.css('.header-menu-prefs')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 4') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 6') })
      .then(_ => driver.findElement(By.css('.Preferences-uxlevel-input')))
        .then(ele => {
          DEBUG && console.log('found uxlevel input')
          if (ele.value !== 'on') ele.click()
        })
      .then(_ => { DEBUG && console.log('admin menu preferences - 7') })
      .then(_ => selenium.clickSelector(By.css('.Preferences-close')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Preferences')))

    .then(_ => { DEBUG && console.log('Open the Table') })
    .then(_ => driver.findElement(By.css('.TableToggle')))
      .then(ele => { TableToggle = ele })
    .then(_ => TableToggle.click())
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Table')))

    .then(_ => selenium.findCssElements(['.Table', '.header', '.assets-footer', '.assets-scroll', '.Assets-tableResize']))
      .then(eles => { elements = eles })

    .then(_ => { DEBUG && console.log('Check the height of assets-scroll before we resize the Table') })
    .then(_ => elements['.assets-scroll'].getCssValue('height'))
      .then(height => { assetsScrollHeight = height })

    .then(_ => { DEBUG && console.log('Expand the Table as far as it will go') })
    .then(_ => dragVertFn('.Assets-tableResize', '.header', -100))
    .then(_ => driver.sleep(5000)) // the first drag is triggering a border & title-bar size change. wait here for it to finish.
    .then(_ => dragVertFn('.Assets-tableResize', '.header', -300))

    .then(_ => { DEBUG && console.log('Check that the table size changed, and that the assets scroll is at the expected minimum') })
    .then(_ => elements['.assets-scroll'].getCssValue('height'))
      .then(height => {
        expect(height).not.toBe(assetsScrollHeight)
        expect(height).toBe(expectedMinAssetsScrollHeight)
      })

    .then(_ => { DEBUG && console.log('Shrink the Table as far as it will go') })
    .then(_ => dragVertFn('.Assets-tableResize', '.assets-footer', 800))

    .then(_ => { DEBUG && console.log('Check that the Table height is at the expected minimum') })
    .then(_ => elements['.Table'].getCssValue('height'))
      .then(height => expect(height).toBe(expectedMinTableHeight))

    .then(_ => { DEBUG && console.log('Close the Table') })
    .then(_ => TableToggle.click())
    .then(_ => selenium.expectSelectorVisibleToBe(false, By.css('.Table')))
  })
})
