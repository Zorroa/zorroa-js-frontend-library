require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

const DEBUG = true

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

  var emptyTrash = function () {
    return selenium.getCssElementVisible('.Collections-collapsible .Trash')
    .then(trashVisible => {
      if (!trashVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 1') })
      return selenium.getCssElementVisible('.Trash-body')
      .then(trashBodyVisible => {
        if (!trashBodyVisible) return selenium.clickCssElement('.Trash-toggle')
      })
      .then(_ => selenium.getCssElementVisible('.Collections-collapsible .Trash-empty'))
      .then(trashEmptyVisible => {
        if (!trashEmptyVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 2') })
        driver.then(_ => { DEBUG && console.log('emptying trash') })
        selenium.waitForCssElementVisible('.Collections-collapsible .Trash-empty', 5000)
        selenium.clickCssElement('.Collections-collapsible .Trash-empty')
        selenium.waitForIdle(15000)
        selenium.waitForCssElementNotVisible('.Collections-collapsible .Trash', 5000)
        return driver
      })
    })
  }

  it('user logs in', function () {
    DEBUG && console.log('user logs in')
    selenium.login()

    // Wait for the default server query to return, and start displaying assets
    selenium.waitForIdle(15000)
    selenium.waitForCssElementVisible('.assets-footer', 15000)

    return driver
  })

  it('open collections panel', function () {
    return driver
    .then(_ => { DEBUG && console.log('Open the collections panel (TODO: check if already open)') })
    .then(_ => selenium.waitForCssElementVisible('.Collections-collapsible .CollapsibleHeader', 5000))
    .then(_ => selenium.clickCssElement('.Collections-collapsible .CollapsibleHeader'))
    // .then(_ => selenium.waitForBusy())
    .then(_ => selenium.waitForIdle())
    .then(_ => selenium.waitForCssElementVisible('.FolderItem', 15000))
  })

  it('empty any trash', function () {
    return driver
    .then(_ => { DEBUG && console.log('If theres any trash, empty it now') })
    .then(_ => emptyTrash())
  })

  it('create a new search, then delete it (assumes trash is empty)', function () {
    let timeStr = Date.now().toString()
    let searchStr = '_selenium_' + timeStr
    let searchBar

    driver.then(_ => { DEBUG && console.log('Search for something we know exists') })
    driver.findElement(By.css('.Suggestions-search')).then(ele => { searchBar = ele })
    driver.then(_ => searchBar.clear())
    driver.then(_ => searchBar.sendKeys('dumbo', Key.ENTER))
    selenium.waitForIdle()

    driver.then(_ => { DEBUG && console.log('Open the racetrack') })
    selenium.clickCssElement('.Sidebar-open-close-button.isRightEdge')
    selenium.waitForCssElementVisible('.Racetrack')

    driver.then(_ => { DEBUG && console.log('Save the search') })
    selenium.clickCssElement('.Racetrack-footer-save')
    selenium.waitForCssElementVisible('.modal .CreateFolder')
    driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(searchStr))
    selenium.clickCssElement('.CreateFolder-save')
    driver.then(_ => { DEBUG && console.log('wait for saved search') })
    driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${searchStr}')]`)))

    driver.then(_ => { DEBUG && console.log('Clear the racetrack') })
    selenium.clickCssElement('.Racetrack-footer-clear')
    selenium.waitForCssElementVisible('.Racetrack-empty')

    driver.then(_ => { DEBUG && console.log('Rename the saved search') })
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

    driver.then(_ => { DEBUG && console.log('Restore the saved search') })
    folderXpath = `//*[contains(text(), '${searchStr}-renamed')]` // http://stackoverflow.com/a/30648604/1424242
    driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele })
    driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-menu')
    selenium.clickCssElement('.FolderItem-context-restore-widgets')
    selenium.waitForCssElementNotVisible('.Racetrack-empty')
    selenium.expectCssElementIsVisible('.Racetrack-filters')

    driver.then(_ => { DEBUG && console.log('Delete the saved search') })
    driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-remove-folder')
    selenium.clickCssElement('.FolderItem-context-remove-folder')
    selenium.waitForCssElementNotVisible('.FolderItem-context-menu', 5000)
    selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000)

    driver.then(_ => emptyTrash())

    return driver
  })

  it('add & remove assets', function () {
    let allUsersFolder
    let myUserFolder
    const myUserName = 'selenium'

    driver.then(_ => { DEBUG && console.log('find & toggle the Users folder') })
    selenium.getFolderNamed('Users').then(ele => { allUsersFolder = ele })
    // Toggle open the users folder
    driver.then(_ => { DEBUG && console.log('toggle the Users folder') })
    driver.then(_ => allUsersFolder.findElement(By.css('.FolderItem-toggle')).click())
    selenium.waitForIdle()
    // select the users folder
    driver.then(_ => { DEBUG && console.log('select the Users folder') })
    driver.then(_ => allUsersFolder.click())
    selenium.waitForIdle()

    let repeatCount = 0
    var deleteOldFolders = () => {
      if (repeatCount++ > 7) return
      // If there's an old selenium user folder, delete it
      selenium.getFolderNamed(myUserName).then(
        folder => {
          driver.then(_ => { DEBUG && console.log('remove "selenium" folder') })
          driver.then(_ => driver.actions().click(folder, 2).perform()) // right-click
          selenium.waitForCssElementVisible('.FolderItem-context-remove-folder')
          selenium.clickCssElement('.FolderItem-context-remove-folder')
          selenium.waitForCssElementNotVisible('.FolderItem-context-remove-folder', 5000)
          selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000)
          driver.then(_ => emptyTrash())
          return driver.then(deleteOldFolders)
        },
        err => { /* good, nothing here */ }
      )
    }
    driver.then(deleteOldFolders)

    driver.then(_ => { DEBUG && console.log('Add a "selenium" user folder') })
    selenium.clickCssElement('.Folders-controls-add')
    selenium.waitForCssElementVisible('.modal .CreateFolder')
    driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(myUserName))
    selenium.clickCssElement('.CreateFolder-save')
    selenium.waitForCssElementNotVisible('.modal .CreateFolder')
    selenium.waitForIdle()

    driver.then(_ => { DEBUG && console.log('deselect the Users folder') })
    driver.then(_ => allUsersFolder.click())
    selenium.waitForIdle()

    driver.then(_ => { DEBUG && console.log('find the new "selenium" user folder') })

    // wait til folder count says 0
    driver.wait(_ => {
      return selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e })
      .then(_ => myUserFolder.findElement(By.css('.FolderItem-count')))
      .then(ele => ele.getText())
      .then(t => t === '0')
    }, 15000)

    driver.then(_ => { DEBUG && console.log('add an asset to the new folder') })
    selenium.waitForCssElementVisible('.Thumb')
    selenium.clickCssElement('.Thumb')
    selenium.waitForIdle()
    driver.then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-add-assets', 5000)
    selenium.clickCssElement('.FolderItem-context-add-assets')
    selenium.waitForCssElementNotVisible('.FolderItem-context-add-assets', 5000)
    selenium.waitForIdle()

    // wait til folder count says 1

    driver.wait(_ => {
      return selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e })
      .then(_ => myUserFolder.findElement(By.css('.FolderItem-count')))
      .then(ele => ele.getText())
      .then(t => t === '1')
    }, 15000)

    // remove the asset from the new folder (asset should still be selected) // TODO: remove not working
    driver.then(_ => myUserFolder.click())
    selenium.waitForIdle()
    driver.then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-remove-assets')
    selenium.clickCssElement('.FolderItem-context-remove-assets')
    selenium.waitForCssElementNotVisible('.FolderItem-context-remove-assets')
    // selenium.waitForBusy()
    selenium.waitForIdle()

    // wait til folder count says 0
    driver.wait(_ => {
      return selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e })
      .then(_ => myUserFolder.findElement(By.css('.FolderItem-count')))
      .then(ele => ele.getText())
      .then(t => t === '0')
    }, 15000)

    driver.then(_ => { DEBUG && console.log('remove "selenium" folder') })
    selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e })
    driver.then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    selenium.waitForCssElementVisible('.FolderItem-context-remove-folder')
    selenium.clickCssElement('.FolderItem-context-remove-folder')
    selenium.waitForCssElementNotVisible('.FolderItem-context-remove-folder', 5000)
    selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000)

    driver.then(_ => emptyTrash())

    return driver
  })
})
