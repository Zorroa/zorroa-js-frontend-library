// require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

const DEBUG = true

describe('Tags', function () {
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

  // open the tags panel if needed
  var openTagsPanel = function () {
    return driver
    .then(_ => { DEBUG && console.log('open the tags panel') })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-collapsible', 5000))
    .then(_ => selenium.doesCssElementHaveClass('.Metadata-collapsible', 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickCssElement('.Metadata-collapsible'))
          driver.then(_ => selenium.waitForIdle())
        }
        return selenium.waitForCssElementVisible('.Metadata-body', 15000)
      })
  }

  // open the tags panel if needed
  // go to all tags (not favorites) if not already there
  // all tests can use this to start the test, that way
  // tests are more independent and can be commented without
  // messing up any other subsequent tests.
  var openAllTags = function () {
    openTagsPanel()
    driver.then(_ => { DEBUG && console.log('show all tags', Date.now()) })
    selenium.waitForCssElementVisible('.Metadata-favorites')
    driver.findElement(By.css('.Metadata-favorites')).getAttribute('class')
      .then(classes => { console.log({classes}) })
    driver.then(_ => selenium.doesCssElementHaveClass('.Metadata-favorites', 'isSelected'))
      .then(isSelected => {
        driver.then(_ => console.log({isSelected}))
        if (!isSelected) return driver
        driver.then(_ => { DEBUG && console.log('show all, hide faves', Date.now()) })
        driver.findElement(By.css('.Metadata-favorites')).click()
        selenium.waitForCssElementVisible('.Metadata-favorites:not(.isSelected)')
        return driver
      })
    driver.then(_ => selenium.waitForCssElementVisible('.Metadata-item'))
    return driver
  }

  // open the racetrack panel if needed
  var openRacetrack = function () {
    return driver
    .then(_ => { DEBUG && console.log('open the racetrack sidebar', Date.now()) })
    .then(_ => selenium.doesCssElementHaveClass('.Sidebar .isRightEdge', 'isOpen'))
      .then(isOpen => {
        if (isOpen) return driver
        return selenium.clickCssElement('.Sidebar .isRightEdge')
        .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))
      })
  }

  it('user logs in', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- user logs in') })
    .then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForIdle(15000))
    .then(_ => selenium.waitForCssElementVisible('.assets-footer', 15000))
  })

  it('open tags panel', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- open tags panel') })
    .then(_ => openTagsPanel())
  })

  it('find some known tags', function () {
    let documentTag

    return driver
    .then(_ => { DEBUG && console.log('--- find some known tags') })
    .then(_ => openAllTags())

    .then(_ => { DEBUG && console.log('standard tags exist?') })
    .then(_ => driver.findElements(By.css('.Metadata-item')))
      .then(elements => {
        expect(elements.length).toBeGreaterThan(10)
        let proms = elements.map(ele => ele.getText())
        return Promise.all(proms)
      })
      .then(eleTexts => {
        let expectedTexts = ['Image Hash', 'Colors', 'Document', 'Image', 'Keywords', 'Proxies', 'Source', 'Video']
        // console.log({expectedTexts, eleTexts})
        let hasExpectedTexts = expectedTexts.map(text => eleTexts.includes(text))
        // console.log({hasExpectedTexts})
        expect(hasExpectedTexts.every(x=>x)).toBe(true)
      })

    .then(_ => { DEBUG && console.log('Document tag has Creator child?') })
    .then(_ => selenium.getTagNamed('Document').then(tag => documentTag = tag))
    .then(_ => documentTag.getAttribute('class'))
    .then(classes => {
      driver.then(_ => { DEBUG && console.log({classes}) })
      if (!(new RegExp(`\\bisLeaf\\b`).test(classes))) return documentTag.click()
    })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-item-document-creator.isLeaf'))
  })

  it('search for some hidden tags', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- search for some hidden tags') })
    .then(_ => openAllTags())
    .then(_ => selenium.clickCssElement('.Metadata-filter input'))
    .then(_ => driver.findElement(By.css('.Metadata-filter input')).sendKeys('creator'))

    .then(_ => { DEBUG && console.log('look for the two "creator" tags') })
    .then(_ => driver.findElements(By.css('.Metadata-item')))
      .then(elements => {
        // on dev, the only creator tags are document.creator and image.iptc.creator
        // with those, there are between 2 and 5 Metadata-item element visible,
        // depending on which parents are open
        expect(elements.length).toBeGreaterThan(1)
        expect(elements.length).toBeLessThan(6)
        return false
      })

    .then(_ => { DEBUG && console.log('clear filter, make sure all tags appear again') })
    .then(_ => selenium.clickCssElement('.Metadata-cancel-filter'))
    .then(_ => driver.findElements(By.css('.Metadata-item')))
      .then(elements => {
        expect(elements.length).toBeGreaterThan(10)
        return false
      })
  })

  it('check tag widget buttons', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- check tag widget buttons') })
    .then(_ => openAllTags())
    .then(_ => openRacetrack())

    .then(_ => { DEBUG && console.log('make sure colors tag bring up color widget') })
    .then(_ => selenium.getTagNamed('Colors'))
      .then(ele => ele.findElement(By.css('.Metadata-item-widget')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForCssElementVisible('.Widget.Color'))
    // .then(_ => selenium.expectCssElementHasClass('.Metadata-item-colors', '.isSelected'))
    .then(_ => selenium.clickCssElement('.Metadata-item-colors'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))

    .then(_ => { DEBUG && console.log('open source tag folder') })
    .then(_ => selenium.getTagNamed('Source').then(ele => ele.click()))

    .then(_ => { DEBUG && console.log('make sure source.basename tag brings up facet widget') })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-item-source-basename'))
    .then(_ => selenium.expectCssElementHasClass('.Metadata-item-source-basename', 'isLeaf'))
    // there are 2 assetType tags (since assetType is first) - the top most one is the tag folder
    .then(_ => selenium.expectCssElementIsVisible('.Metadata-item-source-assetType.isOpen'))
    .then(_ => selenium.expectCssElementIsVisible('.Metadata-item-source-assetType.isLeaf'))
    .then(_ => { DEBUG && console.log('make sure tag shows up as "selected"') })
    .then(_ => selenium.clickCssElement('.Metadata-item-source-basename .Metadata-item-widget'))
    .then(_ => selenium.waitForCssElementToHaveClass('.Metadata-item-source-basename', 'isSelected'))
    .then(_ => selenium.waitForCssElementVisible('.Widget.Facet'))
    .then(_ => { DEBUG && console.log('make sure hovering over tag highlights the facet widget') })
    // not sure why, but moving mouse to basename (that mouse is already over) breaks
    // .then(_ => driver.findElement(By.css('.Metadata-item-source-basename.isLeaf')))
    //   .then(ele => ele.getLocation())
    //   .then(loc => driver.actions().mouseMove(loc).perform())
    .then(_ => selenium.waitForCssElementToHaveClass('.Racetrack-widget', 'hoverField', 10000))
    .then(_ => driver.findElement(By.css('.Metadata-item-source-assetType.isLeaf')))
      .then(ele => ele.getLocation())
      .then(loc => driver.actions().mouseMove(loc).perform())
    .then(_ => selenium.waitForCssElementToNotHaveClass('.Racetrack-widget', 'hoverField', 10000))
    .then(_ => { DEBUG && console.log('delete facet widget') })
    .then(_ => selenium.clickCssElement('.Widget.Facet .WidgetHeader-close'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))

    .then(_ => { DEBUG && console.log('make sure source.date tag brings up date widget') })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-item-source-date'))
    .then(_ => selenium.expectCssElementHasClass('.Metadata-item-source-date', 'isLeaf'))
    .then(_ => selenium.clickCssElement('.Metadata-item-source-date .Metadata-item-widget'))
    .then(_ => selenium.waitForCssElementVisible('.Widget.DateRange'))
    .then(_ => { DEBUG && console.log('delete daterange widget') })
    .then(_ => selenium.clickCssElement('.Widget.DateRange .WidgetHeader-close'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))

    .then(_ => { DEBUG && console.log('make sure source.fileSize tag brings up range widget') })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-item-source-fileSize'))
    .then(_ => selenium.expectCssElementHasClass('.Metadata-item-source-fileSize', 'isLeaf'))
    .then(_ => selenium.clickCssElement('.Metadata-item-source-fileSize .Metadata-item-widget'))
    .then(_ => selenium.waitForCssElementVisible('.Widget.Range'))
    .then(_ => { DEBUG && console.log('delete Range widget') })
    .then(_ => selenium.clickCssElement('.Widget.Range .WidgetHeader-close'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))

    .then(_ => { DEBUG && console.log('make sure source.extension tag brings up range widget') })
    .then(_ => selenium.waitForCssElementVisible('.Metadata-item-source-extension'))
    .then(_ => selenium.expectCssElementHasClass('.Metadata-item-source-extension', 'isLeaf'))
    .then(_ => selenium.clickCssElement('.Metadata-item-source-extension .Metadata-item-widget'))
    .then(_ => selenium.waitForCssElementVisible('.Widget.Filetype'))
    .then(_ => { DEBUG && console.log('delete Filetype widget') })
    .then(_ => selenium.clickCssElement('.Widget.Filetype .WidgetHeader-close'))
    .then(_ => selenium.waitForCssElementVisible('.Racetrack-empty'))
  })

})
