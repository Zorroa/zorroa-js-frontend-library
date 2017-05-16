require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, until, Key } = selenium.webdriver

const DEBUG = true

describe('search widget', function () {
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

  it('user logs in', function () {
    DEBUG && console.log('user logs in')
    return driver.then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
    .then(_ => selenium.waitForIdle(15000))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
  })

  // ------------------------------------
  // Tests below ASSUME we are logged in!
  // ------------------------------------

  it('open the racetrack', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ open the racetrack') })

    .then(_ => selenium.clickSelector(By.css('.Sidebar-open-close-button.isRightEdge')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-empty'), 5000))
  })

  it('check search widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check search widget') })

    .then(_ => selenium.clickSelector(By.css('.Racetrack-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .AddWidget'), 5000))
    .then(_ => selenium.clickSelector(By.css('.widget-SIMPLE_SEARCH')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-Disney-animators'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney-animators input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .SimpleSearch'), 5000))

    .then(_ => { DEBUG && console.log('Set text search to exact match') })
    .then(_ => selenium.doesSelectorHaveClass (By.css('.SimpleSearch-fuzzy .Toggle'), 'checked'))
      .then(checkboxChecked => {
        if (checkboxChecked) return selenium.clickSelector(By.css('.SimpleSearch-fuzzy .Toggle'))
      })
    .then(_ => selenium.waitForSelectorHasClassToBe (false, By.css('.SimpleSearch-fuzzy .Toggle'), 'checked', 5000))

    .then(_ => { DEBUG && console.log('Expect 39 images by Ferguson exact') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.SimpleSearch-fuzzy')))
    .then(_ => selenium.clickSelector(By.css('.SimpleSearch input')))
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Ferguson', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.asset-counter-count')))
    .then(_ => driver.findElement(By.css('.asset-counter-count')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('39'))

    .then(_ => { DEBUG && console.log('Set text search to fuzzy match') })
    // set matching to fuzzy
    .then(_ => selenium.clickSelector(By.css('.SimpleSearch-fuzzy .Toggle')))
    .then(_ => selenium.waitForSelectorHasClassToBe (true, By.css('.SimpleSearch-fuzzy .Toggle'), 'checked', 5000))

    .then(_ => { DEBUG && console.log('Expect 39 images by Farguson fuzzy') })
    // focus the query input
    .then(_ => selenium.clickSelector(By.css('.SimpleSearch input')))
    .then(_ => driver.findElement(By.css('.SimpleSearch input'))).then(ele => ele.clear())
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Farguson', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.asset-counter-count')))
    .then(_ => driver.findElement(By.css('.asset-counter-count')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('39'))

    .then(_ => { DEBUG && console.log('Expect 0 images by Buhler fuzzy') })
    // still fuzzy, right?
    .then(_ => selenium.expectSelectorHasClassToBe (true, By.css('.SimpleSearch-fuzzy .Toggle'), 'checked'))
    .then(_ => selenium.clickSelector(By.css('.SimpleSearch input')))
    .then(_ => driver.findElement(By.css('.SimpleSearch input'))).then(ele => ele.clear())
    .then(_ => driver.findElement(By.css('.SimpleSearch input')))
      .then(ele => ele.sendKeys('Buhler', Key.ENTER))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.assets-footer')))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })


  it('check facet widget', function () {
    let text1, text2

    return driver
    .then(_ => { DEBUG && console.log('------ check facet widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-FACET'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-FACET')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-Disney-alignment'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney-alignment input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Facet'), 5000))

    .then(_ => { DEBUG && console.log('Expect Good and Bad') })
    // click on the first row
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Facet-value-table-row')))
    .then(_ => selenium.clickSelector(By.css('.Facet-value-table-row')))
    .then(selenium.waitForIdle)

    .then(_ => driver.findElement(By.css('.Facet-value-key')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('Good'))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => text1 = text)
    .then(_ => selenium.clickSelector(By.css('.Facet .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => text2 = text)
    .then(_ => { expect(Number(text2)).toBeGreaterThan(Number(text1)) })

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })

  // NB no map widget -- no geo data on dev

  it('check color widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check color widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-COLOR'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-COLOR')))

    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Color'), 5000))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Color'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Color .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Color'), 'isEnabled'))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })

  it('check exists widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check exists widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-EXISTS'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-EXISTS')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-Disney-alignment'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-Disney-alignment input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Exists'), 5000))

    .then(_ => selenium.clickSelector(By.css('.Exists .Toggle')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.clickSelector(By.css('.Exists .Toggle')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Exists'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Exists .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Exists'), 'isEnabled'))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })

  it('check range widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check range widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-RANGE'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-RANGE')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-fileSize'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-fileSize input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Range'), 5000))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Range'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Range .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Range'), 'isEnabled'))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })

  it('check filetype widget', function () {
    let countTotal = 0, countImage = 0, countVector = 0, countVideo = 0

    return driver
    .then(_ => { DEBUG && console.log('------ check filetype widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-FILETYPE'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-FILETYPE')))

    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .Filetype'), 5000))

    .then(_ => driver.findElement(By.css('.Filetype-group-Image .Filetype-group-count'))
      .getText().then(text => countImage = Number(text)))
    // temporarily commented due to no vector assets in the Disney data set
    // .then(_ => driver.findElement(By.css('.Filetype-group-Vector .Filetype-group-count'))
    //   .getText().then(text => countVector = Number(text)))
    .then(_ => driver.findElement(By.css('.Filetype-group-Video .Filetype-group-count'))
      .getText().then(text => countVideo = Number(text)))

    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))

    .then(_ => { expect(countTotal).toBe(countImage + countVector + countVideo) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Image .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countImage) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Image .Check')))
    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Vector .Check')))
    .then(selenium.waitForIdle)
    // temporarily commented due to no vector assets in the Disney data set
    // .then(_ => driver.findElement(By.css('.asset-counter-total'))
    //   .getText().then(text => countTotal = Number(text)))
    // .then(_ => { expect(countTotal).toBe(countVector) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Vector .Check')))
    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Video .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countVideo) })

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Filetype'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Filetype .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Filetype'), 'isEnabled'))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })

  it('check daterange widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check daterange widget') })

    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-input')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.QuickAddWidget-item-DATERANGE'), 5000))
    .then(_ => selenium.clickSelector(By.css('.QuickAddWidget-item-DATERANGE')))

    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack-filters .DateRange'), 5000))

    .then(_ => driver.sleep(1))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-layout-empty')))
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.assets-footer')))

    .then(_ => driver.findElement(By.css('.DateRange-min input')).clear())
    .then(_ => driver.sleep(1))
    .then(_ => driver.findElement(By.css('.DateRange-min input')))
      .then(ele => ele.sendKeys.apply(ele, Array.apply(0, Array(12)).map(_=>Key.BACK_SPACE)))

    .then(_ => driver.sleep(1))
    .then(_ => driver.findElement(By.css('.DateRange-min input')).sendKeys('2010/01/01', Key.TAB))
    .then(_ => selenium.clickSelector(By.css('.DateRange-go')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer')))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DateRange'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.DateRange .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.DateRange'), 'isEnabled'))

    .then(_ => selenium.clickSelector(By.css('.WidgetHeader-close')))
    .then(selenium.waitForIdle)
  })
})
