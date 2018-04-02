require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By, Key } = selenium.webdriver

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

  it('Enable advanced preferences', function () {
    return driver
      .then(_ => { DEBUG && console.log('admin menu preferences') })
      .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.header-menu-user')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 1') })
      .then(_ => selenium.clickSelector(By.css('.header-menu-user')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 2') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.header-menu-prefs')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 3') })
      .then(_ => selenium.clickSelector(By.css('.header-menu-prefs')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 4') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.General')))
      .then(_ => { DEBUG && console.log('admin menu preferences - 6') })
      .then(_ => driver.findElement(By.css('.General-uxlevel-input')))
      .then(ele => {
        DEBUG && console.log('found uxlevel input')
        if (ele.value !== 'on') ele.click()
      })
      .then(_ => { DEBUG && console.log('admin menu preferences - 7') })
      .then(_ => selenium.clickSelector(By.css('.PreferencesPane__header .ModalHeader__close')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.PreferencesPane')))
  })

  it('pin a widget to racetrack', function () {
    return driver
      .then(_ => { DEBUG && console.log('------ pin a widget to racetrack') })
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racetrack'), 5000))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racebar-widget .Widget')))

      .then(_ => { DEBUG && console.log('create a color widget') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-COLOR')))
      .then(_ => selenium.clickSelector(By.css('.widget-COLOR')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racetrack'), 5000))
      .then(_ => { DEBUG && console.log('pin the color widget to open the racetrack') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.WidgetHeader-pin'), 5000))
      .then(_ => selenium.clickSelector(By.css('.WidgetHeader-pin')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racetrack'), 5000))
      .then(_ => { DEBUG && console.log('unpin the color widget to hide the racetrack') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.WidgetHeader-pin'), 5000))
      .then(_ => selenium.clickSelector(By.css('.WidgetHeader-pin')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Racetrack'), 5000))
      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
      .then(selenium.waitForIdle)
  })

  it('check facet widget', function () {
    let text1, text2

    return driver
    .then(_ => { DEBUG && console.log('------ check facet widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-FACET')))
    .then(_ => selenium.clickSelector(By.css('.widget-FACET')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-mediaType'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-mediaType input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Facet'), 5000))

    .then(_ => { DEBUG && console.log('Expect media types') })
    // click on the first row
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Facet-value-table-row')))
    .then(_ => selenium.clickSelector(By.css('.Facet-value-table-row')))
    .then(selenium.waitForIdle)

    .then(_ => driver.findElement(By.css('.Facet-value-key')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('image/png'))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text1 = text })
      .then(_ => { DEBUG && console.log('Disable facet') })
    .then(_ => selenium.clickSelector(By.css('.Facet .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Facet'), 'isEnabled'))
    .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text2 = text })
    .then(_ => { expect(Number(text2)).toBeGreaterThan(Number(text1)) })

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

  it('double facet', function () {
    let text1, text2, text3, text4

    return driver
      .then(_ => { DEBUG && console.log('------ check two facet widgets') })

      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-FACET')))
      .then(_ => selenium.clickSelector(By.css('.widget-FACET')))

      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
      .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-type'), 5000))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-type input')))
      .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
      .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
      .then(selenium.waitForIdle)
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Facet'), 5000))

      .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Facet'), 'isEnabled'))
      .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text1 = text })
      .then(_ => { DEBUG && console.log('Count with no selected facets ' + text1) })

      .then(_ => { DEBUG && console.log('Expect source names') })
      // click on the first row

      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Facet-value-table-row')))
      .then(_ => selenium.clickSelector(By.css('.Facet-value-table-row')))
      .then(selenium.waitForIdle)

      .then(_ => driver.findElement(By.css('.Facet-value-key')))
      .then(ele => ele.getText())
      .then(text => expect(text).toBe('image'))

      .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text2 = text })
      .then(_ => { DEBUG && console.log('Count with one selected facets ' + text2) })
      .then(_ => { expect(Number(text2)).toBeLessThan(Number(text1)) })

      // Open a second facet
      .then(_ => { DEBUG && console.log('Open a second facet on document type') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-FACET')))
      .then(_ => selenium.clickSelector(By.css('.widget-FACET')))

      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
      .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-mediaType'), 5000))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-mediaType input')))
      .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
      .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
      .then(selenium.waitForIdle)

      .then(_ => { DEBUG && console.log('Expect media types') })

      // 4/1/2018: Disable for ARL. This neuters this test which should select a facets
      //           in the second widget and adjust the expect() tests below to show refinement.
      //
      // click on the first row
      // .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Facet-value-table-row')))
      // .then(_ => selenium.clickSelector(By.css('.Facet-value-table-row')))
      // .then(selenium.waitForIdle)

      // .then(_ => driver.findElement(By.css('.Facet-value-key')))
      // .then(ele => ele.getText())
      // .then(text => { console.log('text = ' + text); expect(text).toBe('image/png') })

      .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Facet'), 'isEnabled'))
      .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text3 = text })
      // FIXME: Removing this console.log breaks the test??
      .then(_ => { DEBUG && console.log('Count with two selected facets ' + text3) })
      .then(selenium.waitForIdle)

      .then(_ => { expect(Number(text3)).toBe(82) })
      .then(_ => { expect(Number(text2)).toBe(Number(text3)) })

      .then(_ => { DEBUG && console.log('Closing both facet widgets') })
      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
      .then(selenium.waitForIdle)

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
      .then(selenium.waitForIdle)
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))

      .then(_ => { DEBUG && console.log('Double checking original count') })
      .then(_ => driver.findElement(By.css('.asset-counter-total')))
      .then(ele => ele.getText())
      .then(text => { text4 = text })

      .then(_ => { expect(Number(text4)).toBeGreaterThan(Number(text2)) })
      .then(_ => { expect(text4).toMatch(text1) })
  })

  // NB no map widget -- no geo data on dev

  it('check color widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check color widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-COLOR')))
    .then(_ => selenium.clickSelector(By.css('.widget-COLOR')))

    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Color'), 5000))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Color'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Color .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Color'), 'isEnabled'))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

  it('check exists widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check exists widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-EXISTS')))
    .then(_ => selenium.clickSelector(By.css('.widget-EXISTS')))
    .then(selenium.waitForIdle)

    .then(_ => { DEBUG && console.log('display options') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => { DEBUG && console.log('display options 2') })
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => { DEBUG && console.log('display options 3') })
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
    .then(_ => { DEBUG && console.log('display options 4') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-subType'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-subType input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Exists'), 5000))
    .then(_ => selenium.clickSelector(By.css('.Widget.Exists')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Exists .Toggle'), 5000))
    .then(_ => selenium.clickSelector(By.css('.Exists .Toggle')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.clickSelector(By.css('.Exists .Toggle')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Exists'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Exists .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Exists'), 'isEnabled'))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

  it('check range widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check range widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-RANGE')))
    .then(_ => selenium.clickSelector(By.css('.widget-RANGE')))

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-fileSize'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-fileSize input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Range'), 5000))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Range'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Range .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Range'), 'isEnabled'))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

  it('check filetype widget', function () {
    var countTotal = 0, countImage = 0, countVector = 0, countVideo = 0, countDocument = 0

    return driver
    .then(_ => { DEBUG && console.log('------ check filetype widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-FILETYPE')))
    .then(_ => selenium.clickSelector(By.css('.widget-FILETYPE')))

    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.Filetype'), 5000))

    .then(_ => driver.findElement(By.css('.Filetype-group-Image .Filetype-group-count'))
      .getText().then(text => countImage = Number(text)))
    .then(_ => driver.findElement(By.css('.Filetype-group-Vector .Filetype-group-count'))
      .getText().then(text => countVector = Number(text)))
    .then(_ => driver.findElement(By.css('.Filetype-group-Video .Filetype-group-count'))
      .getText().then(text => countVideo = Number(text)))
    .then(_ => driver.findElement(By.css('.Filetype-group-Document .Filetype-group-count'))
      .getText().then(text => countDocument = Number(text)))

    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))

    .then(_ => { expect(countTotal).toBeLessThan(countImage + countVector + countVideo + countDocument) })
    .then(_ => { expect(countTotal).toBeGreaterThan(countImage + countVector + countVideo) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Image .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countImage) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Image .Check')))
    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Vector .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countVector) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Vector .Check')))
    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Video .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countVideo) })

    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Video .Check')))
    .then(_ => selenium.clickSelector(By.css('.Filetype-group-Document .Check')))
    .then(selenium.waitForIdle)
    .then(_ => driver.findElement(By.css('.asset-counter-total'))
      .getText().then(text => countTotal = Number(text)))
    .then(_ => { expect(countTotal).toBe(countDocument) })

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.Filetype'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.Filetype .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.Filetype'), 'isEnabled'))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

  it('check daterange widget', function () {
    return driver
    .then(_ => { DEBUG && console.log('------ check daterange widget') })

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
    .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-DATERANGE')))
    .then(_ => selenium.clickSelector(By.css('.widget-DATERANGE')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-source-timeModified'), 5000))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-source-timeModified input')))
    .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
    .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
    .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.DateRange'), 5000))

    .then(_ => driver.sleep(1))
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.assets-layout-empty')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer')))
    .then(_ => { DEBUG && console.log('Select a date range to force search') })
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DateRange-setting')))
    .then(_ => selenium.clickSelector(By.css('.DateRange-setting')))
    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-layout-empty')))
    // .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.assets-footer')))

    .then(_ => driver.findElement(By.css('.DateRange-min input')).clear())
    .then(_ => driver.sleep(1))
    .then(_ => driver.findElement(By.css('.DateRange-min input')))
      .then(ele => ele.sendKeys.apply(ele, Array.apply(0, Array(12)).map(_ => Key.BACK_SPACE)))

    .then(_ => driver.sleep(1))
    .then(_ => driver.findElement(By.css('.DateRange-min input')).sendKeys('2010/01/01', Key.TAB))
    .then(_ => selenium.clickSelector(By.css('.DateRange-go')))
    .then(selenium.waitForIdle)

    .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer')))

    .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DateRange'), 'isEnabled'))
    .then(_ => selenium.clickSelector(By.css('.DateRange .WidgetHeader-enable')))
    .then(selenium.waitForIdle)
    .then(_ => selenium.expectSelectorHasClassToBe(false, By.css('.DateRange'), 'isEnabled'))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
    .then(selenium.waitForIdle)
    .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })

it('check similar widget', function () {
    let thumb
    return driver
      .then(_ => { DEBUG && console.log('------ check similar widget') })

      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Racebar-add-widget')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-add-widget')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.widget-SIMILARHASH')))
      .then(_ => selenium.clickSelector(By.css('.widget-SIMILARHASH')))

      // Only needed if dev server has multiple hashes computed
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.modal .DisplayOptions'), 5000))
      .then(_ => selenium.expectSelectorHasClassToBe(true, By.css('.DisplayOptions-update'), 'disabled'))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-analysis')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-analysis-hueSimilarity'), 5000))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-analysis-hueSimilarity')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.DisplayOptions-namespace-analysis-hueSimilarity-shash'), 5000))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-namespace-analysis-hueSimilarity-shash input')))
      .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.DisplayOptions-update'), 'disabled', 5000))
      .then(_ => selenium.waitForSelectorEnabledToBe(true, By.css('.DisplayOptions-update')))
      .then(_ => selenium.clickSelector(By.css('.DisplayOptions-update')))
      .then(selenium.waitForIdle)
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Widget.SimilarHash'), 5000))

      .then(_ => { DEBUG && console.log('Find an asset lower down, below the facet window overlay') })

      .then(_ => driver.findElement(By.css('.Assets-layout')))
        .then(e => e.findElements(By.css('.Thumb')))
        .then(es => { expect(es.length).toBeGreaterThan(7); thumb = es[2] })

      // click on the first row
      .then(_ => { DEBUG && console.log('Select the asset') })
      .then(_ => selenium.waitForSelectorHasClassToBe(true, By.css('.SimilarHash-snap-selected'), 'disabled', 5000))
      .then(_ => thumb.click())
      .then(_ => selenium.waitForIdle())
      .then(_ => selenium.waitForSelectorHasClassToBe(false, By.css('.SimilarHash-snap-selected'), 'disabled', 5000))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.SimilarHash-thumb'), 5000))
      .then(_ => selenium.clickSelector(By.css('.SimilarHash-snap-selected')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.SimilarHash-thumb'), 5000))

      .then(_ => driver.findElement(By.css('.WidgetHeader-close')))
      .then(ele => ele.click())
      .then(selenium.waitForIdle)
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget'), 5000))
  })
})
