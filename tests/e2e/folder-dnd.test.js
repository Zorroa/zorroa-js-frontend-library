require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

const DEBUG = true

describe('Folder dnd', function () {
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

  var emptyTrash = function () {
    return driver

    .then(_ => selenium.getSelectorVisible(By.css('.Collections-collapsible .Trash')))
    .then(trashVisible => {
      if (!trashVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 1') })
      return selenium.getSelectorVisible(By.css('.Trash-body'))
      .then(trashBodyVisible => {
        if (!trashBodyVisible) return selenium.clickSelector(By.css('.Trash-toggle'))
      })
      .then(_ => selenium.getSelectorVisible(By.css('.Collections-collapsible .Trash-empty')))
      .then(trashEmptyVisible => {
        if (!trashEmptyVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 2') })
        return driver
        .then(_ => { DEBUG && console.log('emptying trash') })
        .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Collections-collapsible .Trash-empty'), 5000))
        .then(_ => selenium.clickSelector(By.css('.Collections-collapsible .Trash-empty')))
        .then(_ => selenium.waitForIdle(15000))
        .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Collections-collapsible .Trash'), 5000))
      })
    })
  }

  // open the collections panel if not already open
  var openCollectionsPanel = function () {
    return driver.then(_ => { DEBUG && console.log('open the collections panel') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Collections-collapsible'), 5000))
    .then(_ => selenium.doesSelectorHaveClass(By.css('.Collections-collapsible'), 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickSelector(By.css('.Collections-collapsible')))
          driver.then(_ => selenium.waitForIdle())
        }
        // wait until some folders appear
        return selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem'), 15000)
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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
  })

  function pageDown(by) {
    return driver.then(_ => {
      return driver.findElement(by)
      .then(ele => {
        return ele.getSize()
        .then(size => { return driver.actions().mouseMove(ele, {x:size.width - 5, y: size.height - 5}).click().sendKeys(Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN).perform() })
      })
    })
    .then(_ => driver.sleep(100))
  }

  it('add & remove assets + dnd', function () {
    let allUsersFolder
    let myUserFolder
    const myUserName = `selenium-${Date.now()}`

    let sub1Folder
    let sub2Folder
    let sub3Folder

    return driver.then(_ => openCollectionsPanel())

    // The Film folder is a DyHi created manualy on the first dev instance
    // To create, go to the admin gui, create a folder named Film, and give it these attrs:
    // Attr: Disney.films
    // Attr: Disney.characterName
    // Attr: Disney.documentType
    // Don’t forget to hit SAVE!
    //
    // General approach: 1. make new folder, 2. double click on folder, 3. hit lighting bolt, 4. set dyhi fields, 5. hit save.
    // Must have capitalization of fields correct.
    // To get field names, either select an asset in Curator and use User > Developer to poke around the expandable asset (look under document), or, in the admin ui, you can go to the asset page and look at the full JSON.
    // There are rest endpoints for creating dyhis
    // Used in admin gui and by the curl commands in /zorroa-data/onboard/new-customer.sh
    // Magic enum values are the hardest part.

    .then(_ => { DEBUG && console.log('Open Film & scroll down') })
    .then(_ => selenium.getFolderNamed('Film'))
      .then(folderEle => folderEle.findElement(By.css('.FolderItem-toggle')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForIdle())
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down

    .then(_ => { DEBUG && console.log('find & toggle the Users folder ' + Date.now()) })
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down
    .then(_ => selenium.getFolderNamed('Users').then(ele => { allUsersFolder = ele }))
    // Toggle open the users folder
    .then(_ => { DEBUG && console.log('toggle the Users folder') })
    .then(_ => allUsersFolder.findElement(By.css('.FolderItem-toggle')).click())
    .then(_ => selenium.waitForIdle())
    // select the users folder
    .then(_ => { DEBUG && console.log('select the Users folder') })
    .then(_ => allUsersFolder.click())
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('Add a "selenium" user folder') })
    // using the add folder button this time
    .then(_ => selenium.clickSelector(By.css('.Folders-controls-add')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(myUserName)))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.modal .CreateFolder')))
    .then(_ => selenium.waitForIdle())

    .then(_ => { DEBUG && console.log('deselect the Users folder') })
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down
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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Thumb')))
    .then(_ => selenium.clickSelector(By.css('.Thumb')))
    .then(_ => selenium.waitForIdle())
    .then(_ => driver.actions().click(myUserFolder, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-add-assets'), 5000))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-add-assets')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-add-assets'), 5000))
    .then(_ => selenium.waitForIdle())

    // wait til folder count says 1
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down
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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-remove-assets')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-remove-assets')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-remove-assets')))
    // .then(_ => selenium.waitForBusy())
    .then(_ => selenium.waitForIdle())

    // wait til folder count says 0
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down
    .then(_ => driver.wait(_ => {
      return driver.then(_ => selenium.getFolderNamed(myUserName))
      .then(folderEle => folderEle.findElement(By.css('.FolderItem-count')).getText())
      .then(t => t === '0')
    }, 15000))

    .then(_ => { DEBUG && console.log('add a sub-folder sub1 of selenium ' + Date.now()) })
    // using the menu this time
    .then(_ => selenium.getFolderNamed(myUserName))
      .then(folderEle => driver.actions().click(folderEle, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
      .then(ele => ele.sendKeys(`sub1`))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.modal .CreateFolder')))
    .then(_ => selenium.waitForIdle())
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down

    .then(_ => { DEBUG && console.log('add a sub-folder sub2 of selenium') })
    .then(_ => selenium.getFolderNamed(myUserName))
      .then(folderEle => driver.actions().click(folderEle, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
      .then(ele => ele.sendKeys('sub2'))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.modal .CreateFolder')))
    .then(_ => selenium.waitForIdle())
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down

    .then(_ => { DEBUG && console.log('add a sub-folder sub3 of sub1') })
    .then(_ => selenium.getFolderNamed('sub1'))
      // select folder & then right-click.
      // If sub1's parent is selected, the context menu for sub1 will not contain 'create sub-folder'
      // Filed as bug #143002343. Once fixed, we can remove the select in order to regression test
      .then(folderEle => {
        return folderEle.click()
        .then(_ => selenium.waitForElementHasClassToBe(true, folderEle, 'sub1 folder', 'isSelected', 10000))
        .then(_ => driver.actions().click(folderEle, 2).perform()) // right-click
      })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-create-subfolder')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')))
      .then(ele => ele.sendKeys('sub3'))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.modal .CreateFolder')))
    .then(_ => selenium.waitForIdle())
    .then(_ => pageDown(By.css('.Folders-scroll'))) // scroll down

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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-remove-folder')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-remove-folder')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-remove-folder'), 5000))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Collections-collapsible .Trash'), 15000))

    .then(emptyTrash)
  })
})
