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

  afterEach(function () {
    return selenium.expectNoJSErrors()
  })

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
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-collapsible'), 5000))
    .then(_ => selenium.doesSelectorHaveClass(By.css('.Explorer-collapsible'), 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickSelector(By.css('.Explorer-collapsible')))
          driver.then(_ => selenium.waitForIdle())
        }
        return selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-body'), 15000)
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
    selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-favorites'))
    driver.findElement(By.css('.Explorer-favorites')).getAttribute('class')
      .then(classes => { console.log({classes}) })
    driver.then(_ => selenium.doesSelectorHaveClass(By.css('.Explorer-favorites'), 'isSelected'))
      .then(isSelected => {
        driver.then(_ => console.log({isSelected}))
        if (!isSelected) return driver
        driver.then(_ => { DEBUG && console.log('show all, hide faves', Date.now()) })
        driver.findElement(By.css('.Explorer-favorites')).click()
        selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-favorites:not(.isSelected)'))
        return driver
      })
    driver.then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item')))
    return driver
  }

  it('user logs in', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- user logs in') })
    .then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForIdle(15000))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
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
    .then(_ => driver.findElements(By.css('.Explorer-item')))
      .then(elements => {
        expect(elements.length).toBeGreaterThan(5)
        let proms = elements.map(ele => ele.getText())
        return Promise.all(proms)
      })
      .then(eleTexts => {
        let expectedTexts = ['Media', 'Zorroa', 'Proxies', 'Source', 'Analysis']
        // console.log({expectedTexts, eleTexts})
        let hasExpectedTexts = expectedTexts.map(text => eleTexts.includes(text))
        // console.log({hasExpectedTexts})
        expect(hasExpectedTexts.every(x=>x)).toBe(true)
      })

    .then(_ => { DEBUG && console.log('Media tag has Aspect child?') })
    .then(_ => selenium.getTagNamed('Media').then(tag => documentTag = tag))
    .then(_ => documentTag.getAttribute('class'))
    .then(classes => {
      driver.then(_ => { DEBUG && console.log({classes}) })
      if (!(new RegExp(`\\bisLeaf\\b`).test(classes))) return documentTag.click()
    })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-media-aspect.isLeaf')))
    .then(_ => selenium.getTagNamed('Media').then(ele => ele.click()))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('Explorer-item-media-aspect.isOpen'), 5000))
  })

  it('search for some hidden tags', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- search for some hidden tags') })
    .then(_ => openAllTags())
    .then(_ => selenium.clickSelector(By.css('.Explorer-filter input')))
    .then(_ => driver.findElement(By.css('.Explorer-filter input')).sendKeys('aspect'))

    .then(_ => { DEBUG && console.log('look for the two "aspect" tags') })
    .then(_ => driver.findElements(By.css('.Explorer-item')))
      .then(elements => {
        // on dev, the only aspect tags are document.aspect and image.iptc.aspect
        // with those, there are between 2 and 5 Explorer-item element visible,
        // depending on which parents are open
        expect(elements.length).toBeGreaterThan(0)
        expect(elements.length).toBeLessThan(6)
        return false
      })

    .then(_ => { DEBUG && console.log('clear filter, make sure all tags appear again') })
    .then(_ => selenium.clickSelector(By.css('.Explorer-cancel-filter')))
    .then(_ => driver.findElements(By.css('.Explorer-item')))
      .then(elements => {
        expect(elements.length).toBeGreaterThan(5)
        return false
      })
  })

  it('check tag widget buttons', function () {
    return driver
    .then(_ => { DEBUG && console.log('--- check tag widget buttons') })
    .then(_ => openAllTags())
    .then(_ => selenium.waitForIdle(5000))

    .then(_ => { DEBUG && console.log('make sure proxies tag bring up color widget') })
    .then(_ => { DEBUG && console.log('open proxy tag') })
    .then(_ => selenium.getTagNamed('Proxies').then(ele => ele.click()))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-proxies.isOpen')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-proxies-tinyProxy'), 'isLeaf'))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Explorer-item-proxies-tinyProxy.isLeaf')))
    .then(_ => selenium.getTagNamed('Tiny Proxy'))
      .then(ele => ele.findElement(By.css('.Explorer-item-widget')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Color')), 5000)
    .then(_ => { DEBUG && console.log('delete color widget') })
    .then(_ => driver.findElement(By.css('.Widget.Color .WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    // .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-colors'), '.isSelected'))

    .then(_ => { DEBUG && console.log('open source tag folder') })
    .then(_ => selenium.getTagNamed('Source').then(ele => ele.click()))

    .then(_ => { DEBUG && console.log('make sure source.basename tag brings up facet widget') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source.isOpen')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-source-basename'), 'isLeaf'))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Explorer-item-source-basename.isLeaf')))
    .then(_ => { DEBUG && console.log('make sure tag shows up as "selected"') })
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source-basename .Explorer-item-widget')))
    .then(_ => selenium.waitForSelectorHasClassToBe(true, By.css('.Explorer-item-source-basename'), 'isSelected'))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Facet')))
    .then(_ => { DEBUG && console.log('make sure hovering over tag highlights the facet widget') })
    // not sure why, but moving mouse to basename (that mouse is already over) breaks
    // .then(_ => driver.findElement(By.css('.Explorer-item-source-basename.isLeaf')))
    //   .then(ele => ele.getLocation())
    //   .then(loc => driver.actions().mouseMove(loc).perform())
    .then(_ => selenium.waitForSelectorHasClassToBe(true, By.css('.Racebar-widget'), 'hoverField', 10000))
    // .then(_ => driver.findElement(By.css('.Explorer-item-source.isOpen')))
    //   .then(ele => ele.getLocation())
    //   .then(loc => driver.actions().mouseMove(loc).perform())
    // .then(_ => { DEBUG && console.log('make sure hovering disappears') })
    // .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.Racebar-widget'), 'hoverField', 10000))
    .then(_ => { DEBUG && console.log('delete facet widget') })
    .then(_ => driver.findElement(By.css('.Widget.Facet .WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    .then(_ => { DEBUG && console.log('favorite the source tag') })
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source.isOpen .Explorer-item-favorite:not(.isSelected)')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source.isOpen .Explorer-item-favorite.isSelected'), 5000))

    .then(_ => { DEBUG && console.log('show only favorites') })
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Explorer-favorites'), 'isSelected'))
    .then(_ => selenium.clickSelector(By.css('.Explorer-favorites')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-favorites.isSelected'), 5000))

    .then(_ => { DEBUG && console.log('make sure source.timeCreated tag brings up date widget') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source-timeCreated')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-source-timeCreated'), 'isLeaf'))
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source-timeCreated .Explorer-item-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.DateRange')))
    .then(_ => { DEBUG && console.log('delete daterange widget') })
    .then(_ => driver.findElement(By.css('.Widget.DateRange .WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    .then(_ => { DEBUG && console.log('make sure source.fileSize tag brings up range widget') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source-fileSize')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-source-fileSize'), 'isLeaf'))
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source-fileSize .Explorer-item-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Range')))
    .then(_ => { DEBUG && console.log('delete Range widget') })
    .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    .then(_ => { DEBUG && console.log('make sure source.extension tag brings up filetype widget') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source-extension')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-source-extension'), 'isLeaf'))
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source-extension .Explorer-item-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Filetype')))
    .then(_ => { DEBUG && console.log('delete Filetype widget') })
    .then(_ => driver.findElement(By.css('.Widget.Filetype .WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    .then(_ => { DEBUG && console.log('make sure source.keywords tag brings up facet widget') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Explorer-item-source-keywords')))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Explorer-item-source-keywords'), 'isLeaf'))
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source-keywords .Explorer-item-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Facet')))
    .then(_ => { DEBUG && console.log('delete Facet widget') })
    .then(_ => driver.findElement(By.css('.Widget.Facet .WidgetHeader-close')))
      .then(ele => ele.click())
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

    .then(_ => { DEBUG && console.log('unfavorite the source tag') })
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.Explorer-item-source.isOpen .Explorer-item-favorite.isSelected')))
    .then(_ => selenium.clickSelector(By.css('.Explorer-item-source.isOpen .Explorer-item-favorite.isSelected')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Explorer-item-source.isOpen .Explorer-item-favorite.isSelected')))
  })

})
