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

  // open the collections panel if not already open
  var openCollectionsPanel = function () {
    return driver.then(_ => { DEBUG && console.log('open the collections panel') })
    .then(_ => selenium.waitForCssElementVisible('.Collections-collapsible', 5000))
    .then(_ => selenium.doesCssElementHaveClass('.Collections-collapsible', 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickCssElement('.Collections-collapsible'))
          driver.then(_ => selenium.waitForIdle())
        }
        // wait until some folders appear
        return selenium.waitForCssElementVisible('.FolderItem', 15000)
      })
    .then(_ => selenium.waitForIdle())
  }

  // it('test jests error mechanisms', function () {
  //   return driver.wait(_ => false, 100, '*** FAIL 1 ***').then(x => x)
  //   // .then(x => { console.log('wait', x); return x },
  //   //   x => { console.log('wait', x); return x })
  //   // .catch(err => { console.log(err); throw err })
  //   // .catch(err => { console.log(err); return Promise.reject(err) })
  //   // return driver.then(_ => Promise.reject('*** FAIL 2 ***'))
  //   // return driver
  // })

  // // this fails quickly (as expected) w/ a helpful error
  // it('test jests error mechanisms 1', function () {
  //   return driver.wait(_ => false, 100, '*** FAIL 1 ***')
  // })

  // // this fails slowly (not expected) with a Jest timeout and useless error message
  // it('test jests error mechanisms 2', function () {
  //   driver.wait(_ => false, 100, '*** FAIL 1 ***'); return driver
  // })

  it('user logs in', function () {
    DEBUG && console.log('user logs in')
    return driver.then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForIdle(15000))
    .then(_ => selenium.waitForCssElementVisible('.assets-footer', 15000))
  })

  it('open collections panel', function () {
    return openCollectionsPanel()
  })

  it('empty any trash', function () {
    return driver.then(_ => { DEBUG && console.log('If theres any trash, empty it now') })
    .then(_ => openCollectionsPanel())
    .then(_ => emptyTrash())
  })

  it('create a new search, then delete it (assumes trash is empty)', function () {
    let timeStr = Date.now().toString()
    let searchStr = '_selenium_' + timeStr
    let searchBar

    let folder
    let folderXpath = `//*[contains(text(), '${searchStr}')]` // http://stackoverflow.com/a/30648604/1424242

    return driver.then(_ => openCollectionsPanel())

    .then(_ => { DEBUG && console.log('Search for something we know exists') })
    .then(_ => driver.findElement(By.css('.Suggestions-search')).then(ele => { searchBar = ele }))
    .then(_ => searchBar.clear())
    .then(_ => searchBar.sendKeys('dumbo', Key.ENTER))
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('Open the racetrack') })
    .then(_ => selenium.clickCssElement('.Sidebar-open-close-button.isRightEdge'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack'))

    .then(_ => { DEBUG && console.log('Save the search') })
    .then(_ => selenium.clickCssElement('.Racetrack-footer-save'))
    .then(_ => selenium.waitForCssElementVisible('.modal .CreateFolder'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(searchStr)))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => { DEBUG && console.log('wait for saved search') })
    .then(_ => driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${searchStr}')]`))))

    .then(_ => { DEBUG && console.log('Clear the racetrack') })
    .then(_ => selenium.clickCssElement('.Racetrack-footer-clear'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))

    .then(_ => { DEBUG && console.log('Rename the saved search') })
    .then(_ => driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele }))
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-edit'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-edit'))
    .then(_ => selenium.waitForCssElementVisible('.CreateFolder-input-title-input'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.clear()))
    .then(_ => selenium.clickCssElement('.CreateFolder-input-title-input'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(`${searchStr}-renamed`)))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => selenium.waitForIdle())
    .then(_ => selenium.waitForXpathVisible(`//*[contains(text(), '${searchStr}-renamed')]`))

    .then(_ => { DEBUG && console.log('Restore the saved search') })
    .then(_ => { folderXpath = `//*[contains(text(), '${searchStr}-renamed')]` }) // http://stackoverflow.com/a/30648604/1424242
    .then(_ => driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele }))
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-menu'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-restore-widgets'))
    .then(_ => selenium.waitForCssElementNotVisible('.Racetrack-empty'))
    .then(_ => selenium.expectCssElementIsVisible('.Racetrack-filters'))

    .then(_ => { DEBUG && console.log('Delete the saved search') })
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-remove-folder'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-remove-folder'))
    .then(_ => selenium.waitForCssElementNotVisible('.FolderItem-context-menu', 5000))
    .then(_ => selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000))

    .then(_ => emptyTrash())
  })

  it('add & remove assets + dnd', function () {
    let allUsersFolder
    let myUserFolder
    const myUserName = `selenium-${Date.now()}`

    let sub1Folder
    let sub2Folder
    let sub3Folder

    let repeatCount = 0
    var deleteOldFolders = () => {
      if (repeatCount++ > 7) return
      // If there's an old selenium user folder, delete it
      return selenium.getFolderNamed(myUserName).then(
        folder => {
          return driver.then(_ => { DEBUG && console.log('remove "selenium" folder') })
          .then(_ => driver.actions().click(folder, 2).perform()) // right-click
          .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-remove-folder'))
          .then(_ => selenium.clickCssElement('.FolderItem-context-remove-folder'))
          .then(_ => selenium.waitForCssElementNotVisible('.FolderItem-context-remove-folder', 5000))
          .then(_ => selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000))
          .then(_ => emptyTrash())
          .then(deleteOldFolders)
        },
        err => { /* good, nothing here */ }
      )
    }

    return driver.then(_ => openCollectionsPanel())

    .then(_ => { DEBUG && console.log('find & toggle the Users folder ' + Date.now()) })
    .then(_ => selenium.getFolderNamed('Users').then(ele => { allUsersFolder = ele }))
    // Toggle open the users folder
    .then(_ => { DEBUG && console.log('toggle the Users folder') })
    .then(_ => allUsersFolder.findElement(By.css('.FolderItem-toggle')).click())
    .then(_ => selenium.waitForIdle())
    // select the users folder
    .then(_ => { DEBUG && console.log('select the Users folder') })
    .then(_ => allUsersFolder.click())
    .then(_ => selenium.waitForIdle())

    .then(deleteOldFolders)

    .then(_ => { DEBUG && console.log('Add a "selenium" user folder') })
    // using the add folder button this time
    .then(_ => selenium.clickCssElement('.Folders-controls-add'))
    .then(_ => selenium.waitForCssElementVisible('.modal .CreateFolder'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(myUserName)))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => selenium.waitForCssElementNotVisible('.modal .CreateFolder'))
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('deselect the Users folder') })
    .then(_ => allUsersFolder.click())
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('find the new "selenium" user folder') })

    // wait til folder count says 0
    .then(_ => driver.wait(_ => {
      return driver.then(_ => selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e }))
      .then(_ => myUserFolder.findElement(By.css('.FolderItem-count')))
      .then(ele => ele.getText())
      .then(t => t === '0')
    }, 15000))

    .then(_ => { DEBUG && console.log('add an asset to the new folder') })
    .then(_ => selenium.waitForCssElementVisible('.Thumb'))
    .then(_ => selenium.clickCssElement('.Thumb'))
    .then(_ => selenium.waitForIdle())
    .then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-add-assets', 5000))
    .then(_ => selenium.clickCssElement('.FolderItem-context-add-assets'))
    .then(_ => selenium.waitForCssElementNotVisible('.FolderItem-context-add-assets', 5000))
    .then(_ => selenium.waitForIdle())

    // wait til folder count says 1
    .then(_ => driver.wait(_ => {
      return driver.then(_ => selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e }))
      .then(_ => myUserFolder.findElement(By.css('.FolderItem-count')))
      .then(ele => ele.getText())
      .then(t => t === '1')
    }, 15000))

    // remove the asset from the new folder (asset should still be selected) // TODO: remove not working
    .then(_ => myUserFolder.click())
    .then(_ => selenium.waitForIdle())
    .then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-remove-assets'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-remove-assets'))
    .then(_ => selenium.waitForCssElementNotVisible('.FolderItem-context-remove-assets'))
    // .then(_ => selenium.waitForBusy())
    .then(_ => selenium.waitForIdle())

    // wait til folder count says 0
    .then(_ => driver.wait(_ => {
      return driver.then(_ => selenium.getFolderNamed(myUserName))
      .then(folderEle => folderEle.findElement(By.css('.FolderItem-count')).getText())
      .then(t => t === '0')
    }, 15000))

    .then(_ => { DEBUG && console.log('add a sub-folder sub1 of selenium ' + Date.now()) })
    // using the menu this time
    .then(_ => selenium.getFolderNamed(myUserName))
    .then(folderEle => driver.actions().click(folderEle, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.waitForCssElementVisible('.modal .CreateFolder'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
    .then(ele => ele.sendKeys(`sub1`))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => selenium.waitForCssElementNotVisible('.modal .CreateFolder'))
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('add a sub-folder sub2 of selenium') })
    .then(_ => selenium.getFolderNamed(myUserName))
    .then(folderEle => driver.actions().click(folderEle, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.waitForCssElementVisible('.modal .CreateFolder'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
    .then(ele => ele.sendKeys('sub2'))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => selenium.waitForCssElementNotVisible('.modal .CreateFolder'))
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('add a sub-folder sub3 of sub1') })
    .then(_ => selenium.getFolderNamed('sub1'))
    // select folder & then right-click.
    // If sub1's parent is selected, the context menu for sub1 will not contain 'create sub-folder'
    // Filed as bug #143002343. Once fixed, we can remove the select in order to regression test
    .then(folderEle => {
      return folderEle.click()
      .then(_ => selenium.waitForElementToHaveClass(folderEle, 'sub1 folder', 'isSelected', 10000))
      .then(_ => driver.actions().click(folderEle, 2).perform()) // right-click
    })
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-create-subfolder'))
    .then(_ => selenium.waitForCssElementVisible('.modal .CreateFolder'))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
    .then(ele => ele.sendKeys('sub3'))
    .then(_ => selenium.clickCssElement('.CreateFolder-save'))
    .then(_ => selenium.waitForCssElementNotVisible('.modal .CreateFolder'))
    .then(_ => selenium.waitForIdle())

    // // this doesn't work yet
    // .then(_ => { DEBUG && console.log('move sub3 to be under sub2') })
    // .then(_ => selenium.getFolderNamed('sub1')).then(folder => { sub1Folder = folder })
    // .then(_ => selenium.getFolderNamed('sub2')).then(folder => { sub2Folder = folder })
    // .then(_ => selenium.getFolderNamed('sub3')).then(folder => { sub3Folder = folder })
    // // In the absense of a way to make assertions about the hierarchy,
    // // let's at least make sure the order they're displayed is what we expect
    // // TODO: check actual folder relationships, perhaps via api.js
    // // .then(_ => { DEBUG && console.log('assert order 1') })
    // // .then(_ => sub3Folder.getLocation())
    // // .then(sub3Loc => {
    // //   return sub2Folder.getLocation()
    // //   .then(sub2Loc => {
    // //     expect(sub2Loc.y).toBeGreaterThan(sub3Loc.y)
    // //   })
    // // })

    // .then(_ => { DEBUG && console.log('moving') })
    // .then(_ => selenium.getFolderNamed('sub3'))
    // .then(folderEle => {
    //   DEBUG && console.log('down')
    //   return driver.actions()
    //     .mouseMove(folderEle)
    //     .mouseDown()
    //     .perform()
    // })
    // .then(_ => driver.sleep(200))
    // .then(_ => driver.actions()
    //   .mouseMove({x:5, y:5})
    //   .mouseMove({x:-5, y:-5})
    //   .perform()
    // )
    // .then(_ => driver.sleep(200))
    // .then(_ => selenium.getFolderNamed('sub2'))
    // .then(folderEle => {
    //   DEBUG && console.log('up')
    //   return driver.actions()
    //     .mouseMove(folderEle)
    //     .perform()
    // })
    // .then(_ => driver.sleep(200))
    // .then(_ => driver.actions()
    //   .mouseMove({x:5, y:5})
    //   .mouseMove({x:-5, y:-5})
    //   .perform()
    // )

    // .then(_ => driver.sleep(200))
    // .then(_ => { DEBUG && console.log('waiting to finish the move') })
    // // wait until sub2 folder is receptive
    // .then(_ => driver.wait(
    //   _ => selenium.getFolderNamed('sub2').then(ele => selenium.doesElementHaveClass(ele, 'dragHover'), err => false),
    //   2000, 'timeout waiting for sub2 folder drop target'
    // ))
    // .then(_ => driver.sleep(200))
    // .then(_ => driver.actions().mouseUp().perform())

    // // // webdriver's dragAndDrop doesn't work
    // // .then(_ => sub2Folder.getLocation())
    // // .then(sub2Loc => driver.actions().dragAndDrop(sub3Folder, sub2Loc))
    // // .then(_ => selenium.waitForIdle())

    // now make sure the folder appear in opposite order
    // .then(_ => { DEBUG && console.log('assert order 2') })
    // .then(_ => sub3Folder.getLocation())
    // .then(sub3Loc => {
    //   return sub2Folder.getLocation()
    //   .then(sub2Loc => {
    //     expect(sub3Loc.y).toBeGreaterThan(sub2Loc.y)
    //   })
    // })

    .then(_ => { DEBUG && console.log('remove "selenium" folder') })
    .then(_ => selenium.getFolderNamed(myUserName).then(e => { myUserFolder = e }))
    .then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    .then(_ => selenium.waitForCssElementVisible('.FolderItem-context-remove-folder'))
    .then(_ => selenium.clickCssElement('.FolderItem-context-remove-folder'))
    .then(_ => selenium.waitForCssElementNotVisible('.FolderItem-context-remove-folder', 5000))
    .then(_ => selenium.waitForCssElementVisible('.Collections-collapsible .Trash', 15000))

    .then(emptyTrash)
  })
})
