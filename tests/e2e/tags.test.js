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

  var openTagsPanel = function () {
    driver.then(_ => { DEBUG && console.log('open the tags panel') })
    driver.then(_ => selenium.waitForCssElementVisible('.Metadata-collapsible', 5000))
    driver.then(_ => selenium.doesCssElementHaveClass('.Metadata-collapsible', 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickCssElement('.Metadata-collapsible'))
          driver.then(_ => selenium.waitForIdle())
        }
        return selenium.waitForCssElementVisible('.Metadata-body', 15000)
      })
    return driver
  }

  var openAllTags = function() {
    openTagsPanel()
    driver.then(_ => { DEBUG && console.log('show all tags', Date.now()) })
    selenium.waitForCssElementVisible('.Metadata-favorites')
    driver.findElement(By.css('.Metadata-favorites')).getAttribute('class')
      .then(classes => { console.log({classes}) })
    driver.then(_ => selenium.doesCssElementHaveClass('.Metadata-favorites', 'isSelected'))
      .then(isSelected => {
        driver.then(_ => console.log({isSelected}))
        if (!isSelected) return false
        driver.then(_ => { DEBUG && console.log('show all, hide faves', Date.now()) })
        driver.findElement(By.css('.Metadata-favorites')).click()
        selenium.waitForCssElementVisible('.Metadata-favorites:not(.isSelected)')
        return driver
      })
    driver.then(_ => selenium.waitForCssElementVisible('.Metadata-item'))
    return driver
  }

  it('user logs in', function () {
    driver.then(_ => { DEBUG && console.log('--- user logs in') })
    selenium.login()

    // Wait for the default server query to return, and start displaying assets
    selenium.waitForIdle(15000)
    selenium.waitForCssElementVisible('.assets-footer', 15000)

    return driver
  })

  it('open tags panel', function () {
    driver.then(_ => { DEBUG && console.log('--- open tags panel') })
    openTagsPanel()
    return driver
  })

  it('find some known tags', function () {
    driver.then(_ => { DEBUG && console.log('--- find some known tags') })
    openAllTags()

    driver.then(_ => { DEBUG && console.log('standard tags exist?') })
    driver.then(_ => driver.findElements(By.css('.Metadata-item')))
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

    driver.then(_ => { DEBUG && console.log('Document tag has Creator child?') })
    let documentTag
    selenium.getTagNamed('Document').then(tag => documentTag = tag)
    driver.then(_ => documentTag.getAttribute('class'))
    .then(classes => {
      driver.then(_ => { DEBUG && console.log({classes}) })
      if (!(new RegExp(`\\bisLeaf\\b`).test(classes))) return documentTag.click()
    })
    selenium.waitForCssElementVisible('.Metadata-item-document-creator.isLeaf')

    return driver
  })

  it('search for some hidden tags', function () {
    driver.then(_ => { DEBUG && console.log('--- search for some hidden tags') })
    openAllTags()
    selenium.clickCssElement('.Metadata-filter input')
    driver.findElement(By.css('.Metadata-filter input')).sendKeys('creator')

    driver.then(_ => { DEBUG && console.log('look for the two "creator" tags') })
    driver.findElements(By.css('.Metadata-item'))
    .then(elements => {
      // on dev, the only creator tags are document.creator and image.iptc.creator
      // with those, there are between 2 and 5 Metadata-item element visible,
      // depending on which parents are open
      expect(elements.length).toBeGreaterThan(1)
      expect(elements.length).toBeLessThan(6)
      return false
    })

    driver.then(_ => { DEBUG && console.log('clear filter, make sure all tags appear again') })
    selenium.clickCssElement('.Metadata-cancel-filter')
    driver.findElements(By.css('.Metadata-item'))
    .then(elements => {
      expect(elements.length).toBeGreaterThan(10)
      return false
    })

    return driver
  })

})
