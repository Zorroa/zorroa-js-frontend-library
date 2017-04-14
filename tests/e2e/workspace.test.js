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

  it('user should be able to log in', function () {
    return selenium.login()
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check basic workspace layout', function () {
    var leftSidebar
    var leftSidebarToggle
    var rightSidebar
    var rightSidebarToggle

    return driver
    .then(_ => { DEBUG && console.log('------ check basic workspace layout') })

    .then(_ => { DEBUG && console.log('Make sure Workspace, header, Assets are visible') })
    .then(_ => selenium.expectCssElementIsVisible('.header'))
    .then(_ => selenium.expectCssElementIsVisible('.Workspace'))
    .then(_ => selenium.expectCssElementIsVisible('.Assets'))

    .then(_ => { DEBUG && console.log('Wait for the default server query to return, and start displaying assets') })
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000, 'timeout looking for .assets-footer'))

    .then(_ => selenium.expectCssElementIsVisible('.assets-footer'))

    .then(_ => { DEBUG && console.log('Snag the sidebar elements, make sure theyre visible') })
    .then(_ => driver.findElement(By.css('.Sidebar:not(.isRightEdge)')))
      .then(e => { leftSidebar = e })
    .then(_ => leftSidebar.findElement(By.css('.Sidebar-open-close-button')))
      .then(e => { leftSidebarToggle = e })

    .then(_ => driver.findElement(By.css('.Sidebar.isRightEdge')))
      .then(e => { rightSidebar = e })
    .then(_ => rightSidebar.findElement(By.css('.Sidebar-open-close-button')))
      .then(e => { rightSidebarToggle = e })
    .then(_ => {
      var proms = []
      proms.push(selenium.expectElementIsVisible(leftSidebar, 'leftSidebar'))
      proms.push(selenium.expectElementIsVisible(leftSidebarToggle, 'leftSidebarToggle'))
      proms.push(selenium.expectElementIsVisible(rightSidebar, 'rightSidebarToggle'))
      proms.push(selenium.expectElementIsVisible(rightSidebarToggle, 'rightSidebarToggle'))
      return Promise.all(proms)
    })

    .then(_ => { DEBUG && console.log('Make sure left sidebar is open, right sidebar is closed') })
    .then(_ => leftSidebar.getSize())
      .then(({width, height}) => { expect(width).toBeGreaterThan(100) })
    .then(_ => rightSidebar.getSize())
      .then(({width, height}) => { expect(width).toBeLessThan(100) })

    .then(_ => { DEBUG && console.log('toggle both sidebars') })
    .then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })

    .then(_ => { DEBUG && console.log('Make sure left sidebar is closed, right sidebar is open') })
    .then(_ => leftSidebar.getSize())
      .then(({width, height}) => { expect(width).toBeLessThan(100) })
    .then(_ => rightSidebar.getSize())
      .then(({width, height}) => { expect(width).toBeGreaterThan(100) })

    .then(_ => { DEBUG && console.log('toggle both sidebars again, return to default state') })
    .then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })
  })

  it('test the Searchbar', function () {
    const suggestionsSelector = '.Suggestions-suggestions'
    var searchbarSearch
    var suggestions

    return driver
    .then(_ => { DEBUG && console.log('------ test the Searchbar') })
    .then(_ => { DEBUG && console.log('Search for something we know exists') })
    .then(_ => driver.findElement(By.css('.Suggestions-search')).then(e => { searchbarSearch = e }))
    .then(_ => searchbarSearch.sendKeys('dumbo'))

    .then(_ => { DEBUG && console.log('Make sure the suggestions panel appears & has a valid suggestion') })
    .then(_ => selenium.waitForCssElementVisible(suggestionsSelector, 5000))
    .then(_ => driver.findElements(By.css('.Suggestions-suggestion')))
      .then(elements => { expect(elements.length).toBeGreaterThan(0) })

    .then(_ => { DEBUG && console.log('Make sure a search works and returns assets') })
    .then(_ => selenium.waitForAssetsCounterChange(_ => searchbarSearch.sendKeys(Key.ENTER), 15000))
    .then(_ => driver.findElement(By.css('.Assets-layout')))
      .then(e => e.findElements(By.css('.Thumb')))
      .then(es => { expect(es.length).toBeGreaterThan(0) })

    .then(_ => { DEBUG && console.log('Make sure a bad search returns 0 assets') })
    .then(_ => searchbarSearch.clear())
    .then(_ => selenium.waitForAssetsCounterChange(_ => searchbarSearch.sendKeys(Date.now().toString(), Key.ENTER), 15000))
    .then(_ => selenium.expectCssElementIsVisible('.assets-layout-empty'))

    .then(_ => selenium.clickCssElement('.Suggestions-clear'))
    .then(_ => selenium.waitForIdle())
  })

  it('test the admin menu', function () {
    return driver
    .then(_ => { DEBUG && console.log('') })

    .then(_ => { DEBUG && console.log('admin menu preferences') })
    .then(_ => selenium.expectCssElementIsVisible('.header-menu-user'))
    .then(_ => selenium.clickCssElement('.header-menu-user'))
    .then(_ => selenium.waitForCssElementVisible('.header-menu-prefs'))
    .then(_ => selenium.clickCssElement('.header-menu-prefs'))
    .then(_ => selenium.waitForCssElementVisible('.Preferences'))
    .then(_ => selenium.waitForCssElementVisible('.Preferences-header'))
    .then(_ => selenium.waitForCssElementVisible('.Preferences-user'))
    .then(_ => selenium.waitForCssElementVisible('.Preferences-curator'))
    .then(_ => selenium.waitForCssElementVisible('.Preferences .footer button'))
    .then(_ => selenium.clickCssElement('.Preferences .footer button'))
    .then(_ => selenium.waitForCssElementNotVisible('.Preferences'))

    .then(_ => { DEBUG && console.log('admin menu developer') })
    .then(_ => selenium.expectCssElementIsVisible('.header-menu-user'))
    .then(_ => selenium.clickCssElement('.header-menu-user'))
    .then(_ => selenium.waitForCssElementVisible('.header-menu-dev'))
    .then(_ => selenium.clickCssElement('.header-menu-dev'))
    .then(_ => selenium.waitForCssElementVisible('.Developer'))
    .then(_ => selenium.waitForCssElementVisible('.Developer-title'))
    .then(_ => selenium.waitForCssElementVisible('.Developer-query'))
    .then(_ => selenium.waitForCssElementVisible('.Developer-assets'))
    .then(_ => selenium.waitForCssElementVisible('.Developer-controls'))
    .then(_ => selenium.waitForCssElementVisible('.Developer-done'))
    .then(_ => selenium.clickCssElement('.Developer-done'))
  })

  it('log out', () => {
    let url

    return driver
    .then(_ => { DEBUG && console.log('log out') })
    .then(_ => driver.getCurrentUrl().then(u => { url = u }))
    .then(_ => selenium.expectCssElementIsVisible('.header-menu-user'))
    .then(_ => selenium.clickCssElement('.header-menu-user'))
    .then(_ => selenium.waitForCssElementVisible('.header-menu-logout'))
    .then(_ => selenium.clickCssElement('.header-menu-logout'))
    .then(_ => selenium.waitForUrl(`${url}signin`, 15000))
  })
})
