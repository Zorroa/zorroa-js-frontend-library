require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until, Key } = selenium.webdriver

const DEBUG = false

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
    return selenium.login(driver)
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check basic workspace layout', function () {
    DEBUG && console.log('------ check basic workspace layout')

    var leftSidebar
    var leftSidebarToggle
    var rightSidebar
    var rightSidebarToggle

    return driver

    // Make sure Workspace, header, Assets are visible
    .then(_ => selenium.expectCssElementIsVisible(driver, '.header'))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.Workspace'))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.Assets'))

    // Wait for the default server query to return, and start displaying assets
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000))

    .then(_ => selenium.expectCssElementIsVisible(driver, '.assets-footer'))

    // Snag the sidebar elements, make sure they're visible
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
      proms.push(selenium.expectElementIsVisible(driver, leftSidebar, 'leftSidebar'))
      proms.push(selenium.expectElementIsVisible(driver, leftSidebarToggle, 'leftSidebarToggle'))
      proms.push(selenium.expectElementIsVisible(driver, rightSidebar, 'rightSidebarToggle'))
      proms.push(selenium.expectElementIsVisible(driver, rightSidebarToggle, 'rightSidebarToggle'))
      return Promise.all(proms)
    })

    // Make sure left sidebar is open, right sidebar is closed
    .then(_ => leftSidebar.getSize())
    .then(({width, height}) => expect(width).toBeGreaterThan(100))
    .then(_ => rightSidebar.getSize())
    .then(({width, height}) => expect(width).toBeLessThan(100))

    // toggle both sidebars
    .then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })

    // Make sure left sidebar is closed, right sidebar is open
    .then(_ => leftSidebar.getSize())
    .then(({width, height}) => expect(width).toBeLessThan(100))
    .then(_ => rightSidebar.getSize())
    .then(({width, height}) => expect(width).toBeGreaterThan(100))

    // toggle both sidebars again, return to default state
    .then(_ => {
      leftSidebarToggle.click()
      rightSidebarToggle.click()
    })
  })

  it('test the Searchbar', function () {
    DEBUG && console.log('------ test the Searchbar')
    const suggestionsSelector = '.Searchbar-suggestions'
    var searchbarSearch
    var suggestions

    return driver

    // Search for something we know exists
    .then(_ => driver.findElement(By.css('.Searchbar-search')))
    .then(element => { searchbarSearch = element })
    .then(_ => searchbarSearch.sendKeys('dumbo'))

    // Make sure the suggestions panel appears & has a valid suggestion
    .then(_ => driver.wait(until.elementLocated(By.css(suggestionsSelector)), 1000))
    .then(_ => driver.findElement(By.css(suggestionsSelector)))
    .then(element => { suggestions = element })

    .then(_ => selenium.expectElementIsVisible(driver, suggestions, suggestionsSelector))
    .then(_ => suggestions.findElements(By.css('.Searchbar-suggestion')))
    .then(elementArray => expect(elementArray.length).toBeGreaterThan(0))

    // Make sure a search works and returns assets
    .then(_ => selenium.waitForAssetsCounterChange(driver, _ => searchbarSearch.sendKeys(Key.ENTER), 15000))
    .then(_ => driver.findElement(By.css('.Assets-layout')))
    .then(element => element.findElements(By.css('.Thumb')))
    .then(elementArray => expect(elementArray.length).toBeGreaterThan(0))

    // Make sure a bad search returns 0 assets
    .then(_ => searchbarSearch.clear())
    .then(_ => selenium.waitForAssetsCounterChange(driver,
      _ => searchbarSearch.sendKeys(Date.now().toString(), Key.ENTER), 15000))
    .then(_ => selenium.expectCssElementIsVisible(driver, '.assets-layout-empty'))
  })
})
