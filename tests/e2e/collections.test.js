require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

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
    return selenium.login()

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForRequestSync(15000))
    .then(_ => selenium.waitForCssElementVisible('.assets-footer', 15000))
  })

  it('open collections panel, empty any trash', function () {
    return driver

    // Open the collections panel (TODO: check if already open)
    .then(_ => selenium.clickCssElement('.Collections'))
    .then(_ => selenium.waitForCssElementVisible('.Folders-controls', 15000))

    // If there's any trash, empty it now
    .then(_ => selenium.getCssElementVisible('.Collections .Trash'))
    .then(isVisible => {
      if (!isVisible) return

      selenium.clickCssElement('.Collections .Trash-toggle')
      selenium.waitForCssElementVisible('.Collections .Trash-empty', 15000)
      selenium.clickCssElement('.Collections .Trash-empty')
      selenium.waitForRequestSync(15000)
      selenium.waitForCssElementNotVisible('.Collections .Trash', 15000)

      return driver
    })
  })

  it('create a new search, then delete it (assumes trash is empty)', function () {
    let timeStr = Date.now().toString()
    let searchStr = '_selenium_' + timeStr
    let searchBar

    // Search for something we know exists
    driver.findElement(By.css('.Suggestions-search')).then(ele => { searchBar = ele })
    driver.then(_ => searchBar.clear())
    driver.then(_ => searchBar.sendKeys('dumbo', Key.ENTER))
    selenium.waitForRequestSync()

    // Open the racetrack
    selenium.clickCssElement('.Sidebar-open-close-button.isRightEdge')
    selenium.waitForCssElementVisible('.Racetrack')

    // Save the search
    selenium.clickCssElement('.Racetrack-footer-save')
    selenium.waitForCssElementVisible('.modal .CreateFolder')
    driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(searchStr))
    selenium.clickCssElement('.CreateFolder-save')
    driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${searchStr}')]`)))

    // Clear the racetrack
    selenium.clickCssElement('.Racetrack-footer-clear')
    selenium.waitForCssElementVisible('.Racetrack-empty')

    // Rename the saved search
    let folder
    let folderXpath = `//*[contains(text(), '${searchStr}')]` // http://stackoverflow.com/a/30648604/1424242
    driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele })
    driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-edit')
    selenium.clickCssElement('.FolderItem-context-edit')
    selenium.waitForCssElementVisible('.CreateFolder-input-title-input')
    driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.clear())
    selenium.clickCssElement('.CreateFolder-input-title-input')
    driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(`${searchStr}-renamed`))
    selenium.clickCssElement('.CreateFolder-save')
    selenium.waitForIdle()
    selenium.waitForXpathVisible(`//*[contains(text(), '${searchStr}-renamed')]`)

    // Restore the saved search
    folderXpath = `//*[contains(text(), '${searchStr}-renamed')]` // http://stackoverflow.com/a/30648604/1424242
    driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele })
    driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-menu')
    selenium.clickCssElement('.FolderItem-context-restore-widgets')
    selenium.waitForCssElementNotVisible('.Racetrack-empty')
    selenium.expectCssElementIsVisible('.Racetrack-filters')

    // Delete the saved search
    driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-remove-folder')
    selenium.clickCssElement('.FolderItem-context-remove-folder')
    selenium.waitForCssElementVisible('.Collections .Trash', 15000)

    // empty trash
    selenium.getCssElementVisible('.Collections .Trash-empty')
    .then(isVisible => {
      if (!isVisible) return selenium.clickCssElement('.Collections .Trash-toggle')
    })
    selenium.waitForCssElementVisible('.Collections .Trash-empty', 15000)
    selenium.clickCssElement('.Collections .Trash-empty')
    selenium.waitForIdle(15000)
    selenium.waitForCssElementNotVisible('.Collections .Trash', 15000)

    return driver
  })
})
