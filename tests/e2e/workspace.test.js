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
    driver.then(_ => { DEBUG && console.log('------ check basic workspace layout') })

    var leftSidebar
    var leftSidebarToggle
    var rightSidebar
    var rightSidebarToggle

    driver.then(_ => { DEBUG && console.log('Make sure Workspace, header, Assets are visible') })
    selenium.expectCssElementIsVisible('.header')
    selenium.expectCssElementIsVisible('.Workspace')
    selenium.expectCssElementIsVisible('.Assets')

    driver.then(_ => { DEBUG && console.log('Wait for the default server query to return, and start displaying assets') })
    driver.wait(until.elementLocated(By.css('.assets-footer')), 15000, 'timeout looking for .assets-footer')

    selenium.expectCssElementIsVisible('.assets-footer')

    driver.then(_ => { DEBUG && console.log('Snag the sidebar elements, make sure theyre visible') })
    driver.findElement(By.css('.Sidebar:not(.isRightEdge)'))
    .then(e => { leftSidebar = e })
    .then(_ => leftSidebar.findElement(By.css('.Sidebar-open-close-button')))
    .then(e => { leftSidebarToggle = e })

    driver.findElement(By.css('.Sidebar.isRightEdge'))
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

    driver.then(_ => { DEBUG && console.log('Make sure left sidebar is open, right sidebar is closed') })
    driver.then(_ => leftSidebar.getSize())
    .then(({width, height}) => { expect(width).toBeGreaterThan(100) })
    .then(_ => rightSidebar.getSize())
    .then(({width, height}) => { expect(width).toBeLessThan(100) })

    driver.then(_ => { DEBUG && console.log('toggle both sidebars') })
    driver.then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })

    driver.then(_ => { DEBUG && console.log('Make sure left sidebar is closed, right sidebar is open') })
    driver.then(_ => leftSidebar.getSize())
    .then(({width, height}) => { expect(width).toBeLessThan(100) })
    .then(_ => rightSidebar.getSize())
    .then(({width, height}) => { expect(width).toBeGreaterThan(100) })

    driver.then(_ => { DEBUG && console.log('toggle both sidebars again, return to default state') })
    driver.then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })

    return driver
  })

  it('test the Searchbar', function () {
    driver.then(_ => { DEBUG && console.log('------ test the Searchbar') })
    const suggestionsSelector = '.Suggestions-suggestions'
    var searchbarSearch
    var suggestions

    driver.then(_ => { DEBUG && console.log('Search for something we know exists') })
    driver.findElement(By.css('.Suggestions-search')).then(e => { searchbarSearch = e })
    driver.then(_ => searchbarSearch.sendKeys('dumbo'))

    driver.then(_ => { DEBUG && console.log('Make sure the suggestions panel appears & has a valid suggestion') })
    selenium.waitForCssElementVisible(suggestionsSelector, 5000)
    driver.findElements(By.css('.Suggestions-suggestion')).then(elements => { expect(elements.length).toBeGreaterThan(0) })

    driver.then(_ => { DEBUG && console.log('Make sure a search works and returns assets') })
    selenium.waitForAssetsCounterChange(_ => searchbarSearch.sendKeys(Key.ENTER), 15000)
    driver.findElement(By.css('.Assets-layout')).then(e => e.findElements(By.css('.Thumb'))).then(es => { expect(es.length).toBeGreaterThan(0) })

    driver.then(_ => { DEBUG && console.log('Make sure a bad search returns 0 assets') })
    driver.then(_ => searchbarSearch.clear())
    selenium.waitForAssetsCounterChange(_ => searchbarSearch.sendKeys(Date.now().toString(), Key.ENTER), 15000)
    selenium.expectCssElementIsVisible('.assets-layout-empty')

    selenium.clickCssElement('.Suggestions-clear')
    selenium.waitForIdle()

    return driver
  })

  it('test the admin menu', function () {
    driver.then(_ => { DEBUG && console.log('') })

    driver.then(_ => { DEBUG && console.log('admin menu preferences') })
    selenium.expectCssElementIsVisible('.header-menu-user')
    selenium.clickCssElement('.header-menu-user')
    selenium.waitForCssElementVisible('.header-menu-prefs')
    selenium.clickCssElement('.header-menu-prefs')
    selenium.waitForCssElementVisible('.Preferences')
    selenium.waitForCssElementVisible('.Preferences-header')
    selenium.waitForCssElementVisible('.Preferences-user')
    selenium.waitForCssElementVisible('.Preferences-curator')
    selenium.waitForCssElementVisible('.Preferences .footer button')
    selenium.clickCssElement('.Preferences .footer button')
    selenium.waitForCssElementNotVisible('.Preferences')

    driver.then(_ => { DEBUG && console.log('admin menu developer') })
    selenium.expectCssElementIsVisible('.header-menu-user')
    selenium.clickCssElement('.header-menu-user')
    selenium.waitForCssElementVisible('.header-menu-dev')
    selenium.clickCssElement('.header-menu-dev')
    selenium.waitForCssElementVisible('.Developer')
    selenium.waitForCssElementVisible('.Developer-title')
    selenium.waitForCssElementVisible('.Developer-query')
    selenium.waitForCssElementVisible('.Developer-assets')
    selenium.waitForCssElementVisible('.Developer-controls')
    selenium.waitForCssElementVisible('.Developer-done')
    selenium.clickCssElement('.Developer-done')

    return driver
  })

  it('log out', () => {
    let url
    driver.then(_ => { DEBUG && console.log('log out') })
    driver.getCurrentUrl().then(u => { url = u })
    selenium.expectCssElementIsVisible('.header-menu-user')
    selenium.clickCssElement('.header-menu-user')
    selenium.waitForCssElementVisible('.header-menu-logout')
    selenium.clickCssElement('.header-menu-logout')
    driver.then(_ => selenium.waitForUrl(`${url}signin`, 15000))

    return driver
  })
})
