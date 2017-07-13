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
    return selenium.login()
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('check basic workspace layout', function () {
    var leftSidebar
    var racebar

    return driver
    .then(_ => { DEBUG && console.log('------ check basic workspace layout') })

    .then(_ => { DEBUG && console.log('Make sure Workspace, header, Assets are visible') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Workspace')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Assets')))

    .then(_ => { DEBUG && console.log('Wait for the default server query to return, and start displaying assets') })
    .then(_ => driver.wait(until.elementLocated(By.css('.assets-footer')), 15000, 'timeout looking for .assets-footer'))

    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.assets-footer')))

    .then(_ => { DEBUG && console.log('Snag the sidebar elements, make sure theyre visible') })
    .then(_ => driver.findElement(By.css('.Sidebar:not(.isRightEdge)')))
      .then(e => { leftSidebar = e })

    .then(_ => driver.findElement(By.css('.Racebar')))
      .then(e => { racebar = e })
    .then(_ => {
      var proms = []
      proms.push(selenium.expectElementVisibleToBe(true, leftSidebar, 'leftSidebar'))
      proms.push(selenium.expectElementVisibleToBe(true, racebar, 'rightSidebarToggle'))
      return Promise.all(proms)
    })

    .then(_ => { DEBUG && console.log('Make sure left sidebar is open, right sidebar is closed') })
    .then(_ => leftSidebar.getSize())
      .then(({width, height}) => { expect(width).toBeGreaterThan(100) })
    .then(_ => racebar.getSize())
      .then(({width, height}) => { expect(width).toBeGreaterThan(100); expect(height).toBeLessThan(50) })
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

    // .then(_ => { DEBUG && console.log('Make sure the suggestions panel appears & has a valid suggestion') })
    // .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css(suggestionsSelector), 5000))
    // .then(_ => driver.findElements(By.css('.Suggestions-suggestion')))
    //   .then(elements => { expect(elements.length).toBeGreaterThan(0) })

    .then(_ => { DEBUG && console.log('Make sure a search works and returns assets') })
    .then(_ => searchbarSearch.sendKeys(Key.ENTER), 15000)
    .then(_ => selenium.waitForIdle())
    .then(_ => driver.findElement(By.css('.Assets-layout')))
      .then(e => e.findElements(By.css('.Thumb')))
      .then(es => { expect(es.length).toBeGreaterThan(0) })

    .then(_ => { DEBUG && console.log('Make sure a bad search returns 0 assets') })
    .then(_ => selenium.clickSelector(By.css('.Suggestions-clear')))
    .then(_ => selenium.waitForIdle())
    // Why do none of these work??
    // .then(_ => searchbarSearch.clear())
    // .then(_ => searchbarSearch.sendKeys(Key.DELETE, Key.DELETE, Key.DELETE, Key.DELETE, Key.DELETE))
    // .then(_ => searchbarSearch.sendKeys(Key.chord(Key.CONTROL, 'a'), Key.DELETE, Date.now().toString(), Key.ENTER))
    // .then(_ => selenium.waitForIdle())
    .then(_ => searchbarSearch.sendKeys(Date.now().toString(), Key.ENTER))
    .then(_ => selenium.waitForIdle())
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.assets-layout-empty')))

    .then(_ => selenium.clickSelector(By.css('.Suggestions-clear')))
    .then(_ => selenium.waitForIdle())
  })

  it('test the admin menu', function () {
    return driver
    .then(_ => { DEBUG && console.log('admin menu preferences') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-user')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-user')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header-menu-prefs')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-prefs')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences-header')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences-user')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences-curator')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Preferences .footer button')))
    .then(_ => selenium.clickSelector(By.css('.Preferences .footer button')))
    .then(_ => { DEBUG && console.log('-- 1 --') })
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Preferences')))
    .then(_ => { DEBUG && console.log('-- 2 --') })

    .then(_ => { DEBUG && console.log('admin menu developer') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-user')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-user')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header-menu-dev')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-dev')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer-title')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer-query')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer-assets')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer-controls')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Developer-done')))
    .then(_ => selenium.clickSelector(By.css('.Developer-done')))
  })

  it('command progress', () => {
    return driver
      .then(_ => { DEBUG && console.log('command progress') })
      .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-Import .DropdownMenu')))
      .then(_ => selenium.clickSelector(By.css('.header-menu-Import .DropdownMenu')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.JobMenu-permissions')))
      .then(_ => selenium.clickSelector(By.css('.JobMenu-permissions')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.AssetPermissions')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.AclEditor')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.AclEditor-permissions')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.AclEditor-permission-items')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('input[name="user__selenium"]')))
      .then(_ => driver.findElement(By.css('input[name="user__selenium"]')).click())
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.AssetPermissions-apply')))
      .then(_ => selenium.clickSelector(By.css('.AssetPermissions-apply')))
      .then(_ => { DEBUG && console.log('command progress - started command') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.ProgressBar')))
      .then(_ => driver.sleep(5000)) // progress bar is supposed to be visible for 5 seconds
      .then(_ => { DEBUG && console.log('command progress - woke up') })
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.ProgressBar')))
      .then(_ => { DEBUG && console.log('command progress - finished') })
  })

  it ('make sure embed mode works', () => {
    return driver
      .then(_ => driver.get(`${selenium.BASE_URL}?EmbedMode=true`))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Workspace')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Assets')))
      .then(_ => selenium.waitForIdle())
      .then(_ => selenium.expectSelectorVisibleToBe(false, By.css('.header')))

      .then(_ => driver.get(`${selenium.BASE_URL}?EmbedMode=false`))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Workspace')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Assets')))
      .then(_ => selenium.waitForIdle())
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header')))
  })

  it('log out', () => {
    return driver
    .then(_ => { DEBUG && console.log('log out') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-user')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-user')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header-menu-logout')))
    .then(_ => selenium.clickSelector(By.css('.header-menu-logout')))
    .then(_ => selenium.waitForUrl(`${selenium.BASE_URL}/signin`, 15000))
  })
})
