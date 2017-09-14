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
    return selenium.getSelectorVisible(By.css('.Home-collapsible .Trash'))
    .then(trashVisible => {
      if (!trashVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 1') })
      return selenium.getSelectorVisible(By.css('.Trash-body'))
      .then(trashBodyVisible => {
        if (!trashBodyVisible) return selenium.clickSelector(By.css('.Trash-toggle'))
      })
      .then(_ => selenium.getSelectorVisible(By.css('.Home-collapsible .Trash-empty')))
      .then(trashEmptyVisible => {
        if (!trashEmptyVisible) return driver.then(_ => { DEBUG && console.log('no trash to empty 2') })
        return driver.then(_ => { DEBUG && console.log('emptying trash') })
        .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Home-collapsible .Trash-empty'), 5000))
        .then(_ => selenium.clickSelector(By.css('.Home-collapsible .Trash-empty')))
        .then(_ => selenium.waitForIdle(15000))
        .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Home-collapsible .Trash'), 5000))
      })
    })
  }

  // open the collections panel if not already open
  var openCollectionsPanel = function () {
    return driver
    .then(_ => { DEBUG && console.log('open the collections panel') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Home-collapsible'), 5000))
    .then(_ => selenium.doesSelectorHaveClass(By.css('.Home-collapsible'), 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickSelector(By.css('.Home-collapsible')))
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

  it('open collections panel', function () {
    return openCollectionsPanel()
  })

  it('empty any trash', function () {
    return driver.then(_ => { DEBUG && console.log('If theres any trash, empty it now') })
    .then(_ => openCollectionsPanel())
    .then(_ => emptyTrash())
  })

  function pageDown(by) {
    return driver.then(_ => {
      return driver.findElement(by)
        .then(ele => {
          return ele.getSize()
            .then(size => { return driver.actions().mouseMove(ele, {x:size.width - 5, y: size.height - 5}).click().sendKeys(Key.PAGE_DOWN, Key.PAGE_DOWN, Key.PAGE_DOWN).perform() })
        })
    })
      .then(_ => driver.sleep(100))
  }

  // Disable until we open all parents to a newly created search folder
  // now created underneath the user's personal folder rather than root
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

    .then(_ => { DEBUG && console.log('Save the search') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-save')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(searchStr)))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => { DEBUG && console.log('wait for saved search') })
    .then(_ => driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${searchStr}')]`))))

    .then(_ => { DEBUG && console.log('Clear the racetrack') })
    .then(_ => selenium.clickSelector(By.css('.Racebar-clear')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget')))

    .then(_ => { DEBUG && console.log('Rename the saved search') })
    .then(_ => driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele }))
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-edit')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-edit')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.CreateFolder-input-title-input')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.clear()))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-input-title-input')))
    .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(`${searchStr}-renamed`)))
    .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
    .then(_ => selenium.waitForIdle())
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.xpath(`//*[contains(text(), '${searchStr}-renamed')]`)))
    .then(_ => selenium.clickSelector(By.css('.Racebar-clear')))
    .then(_ => expect(searchBar.value === ''))

    .then(_ => { DEBUG && console.log('Restore the saved search') })
    .then(_ => { folderXpath = `//*[contains(text(), '${searchStr}-renamed')]` }) // http://stackoverflow.com/a/30648604/1424242
    .then(_ => driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele }))
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-menu')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-restore-widgets')))
    .then(_ => expect(searchBar.value === 'dumbo'))

    .then(_ => { DEBUG && console.log('Delete the saved search') })
    .then(_ => driver.actions().click(folder, 2).perform()) // right-click
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-remove-folder')))
    .then(_ => selenium.clickSelector(By.css('.FolderItem-context-remove-folder')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-menu'), 5000))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Home-collapsible .Trash'), 15000))

    .then(_ => emptyTrash())
  })

  it('create a search and make it a taxonomy', function () {
    let timeStr = Date.now().toString()
    let searchStr = '_selenium_' + timeStr
    let searchBar

    let folder
    let folderXpath = `//*[contains(text(), '${searchStr}')]` // http://stackoverflow.com/a/30648604/1424242
    let taxonomyItem

    return driver.then(_ => openCollectionsPanel())

      .then(_ => { DEBUG && console.log('Search for something we know exists') })
      .then(_ => driver.findElement(By.css('.Suggestions-search')).then(ele => { searchBar = ele }))
      .then(_ => searchBar.clear())
      .then(_ => searchBar.sendKeys('dumbo', Key.ENTER))
      .then(_ => selenium.waitForIdle())

      .then(_ => { DEBUG && console.log('Save the search') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-save')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .CreateFolder')))
      .then(_ => driver.findElement(By.css('.CreateFolder-input-title-input')).then(ele => ele.sendKeys(searchStr)))
      .then(_ => selenium.clickSelector(By.css('.CreateFolder-save')))
      .then(_ => { DEBUG && console.log('wait for saved search') })
      .then(_ => driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${searchStr}')]`))))

      .then(_ => { DEBUG && console.log('Clear the racetrack') })
      .then(_ => selenium.clickSelector(By.css('.Racebar-clear')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget')))

      .then(_ => { DEBUG && console.log('Make it a taxonomy') })
      .then(_ => driver.findElement(By.xpath(folderXpath)).then(ele => { folder = ele }))
      .then(_ => driver.actions().click(folder, 2).perform()) // right-click
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-menu')))
      .then(_ => selenium.clickSelector(By.css('.FolderItem-context-taxonomy')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-menu')))

      .then(_ => driver.actions().click(folder, 2).perform()) // right-click
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-menu')))
      .then(_ => driver.findElement(By.css('.FolderItem-context-taxonomy')).then(ele => { taxonomyItem = ele }))
      .then(_ => expect(taxonomyItem.value === 'Delete Taxonomy'))
      .then(_ => selenium.clickSelector(By.css('.FolderItem-context-taxonomy')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-menu')))

      .then(_ => { DEBUG && console.log('Delete the saved search') })
      .then(_ => driver.actions().click(folder, 2).perform()) // right-click
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.FolderItem-context-remove-folder')))
      .then(_ => selenium.clickSelector(By.css('.FolderItem-context-remove-folder')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.FolderItem-context-menu'), 5000))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Home-collapsible .Trash'), 15000))

      .then(_ => emptyTrash())
  })
})
