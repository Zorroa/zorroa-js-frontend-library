require('babel-register')({})
import * as selenium from './selenium.js'
var driver
const { By, Key, until } = selenium.webdriver

const DEBUG = true

describe('Jobs', function () {
  // For all jest functions that are passed a function parameter
  // (it, beforeEach, afterEach, beforeAll, afterAll):
  // if the passed function takes a callback, jest will wait for the callback to be called
  // if the passed function returns a promise, jest will wait for the promise to resolve
  //
  // Add tests for:
  //   * filter string
  //   * create new import, verify progress and errors
  //   * create new export, verify progress and errors
  //   * download export

  const suite = this

  beforeAll(function (/* doneFn */) {
    driver = selenium.startBrowserAndDriver(suite)
    return driver
  })

  afterAll(function () {
    return selenium.stopBrowserAndDriver()
  })

  afterEach(function () {
    return selenium.expectNoJSErrors()
  })

  // open the collections panel if not already open
  var openJobsPanel = function (title) {
    const collapsibleClass = `.${title}Jobs-collapsible`
    return driver
      .then(_ => { DEBUG && console.log('open the jobs panel') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css(collapsibleClass), 5000))
      .then(_ => selenium.doesSelectorHaveClass(By.css(collapsibleClass), 'isOpen'))
      .then(isOpen => {
        if (!isOpen) {
          driver.then(_ => selenium.clickSelector(By.css(collapsibleClass)))
          driver.then(_ => selenium.waitForIdle())
        }
        // wait until some folders appear
        return selenium.waitForSelectorVisibleToBe(true, By.css('.Jobs'), 15000)
      })
      .then(_ => selenium.waitForIdle())
  }

  it('user logs in', function () {
    DEBUG && console.log('user logs in')
    return driver.then(_ => selenium.login())

    // Wait for the default server query to return, and start displaying assets
      .then(_ => selenium.waitForIdle(15000))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.assets-footer'), 15000))
  })

  it('open import panel', function () {
    return openJobsPanel('Import')
  })

  it('select an import and clear its widget', function () {
    return driver.then(_ => openJobsPanel('Import'))
      .then(_ => { DEBUG && console.log('Find the base import') })
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Jobs-job')))
      .then(_ => selenium.clickSelector(By.css('.Jobs-job')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.ImportSet-import')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Jobs-job.isSelected')))
      .then(_ => selenium.clickSelector(By.css('.Racebar-clear')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.ImportSet-import')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Widget')))
      .then(_ => selenium.waitForSelectorVisibleToBe(true, By.css('.Jobs-job')))
      .then(_ => selenium.waitForSelectorVisibleToBe(false, By.css('.Jobs-job.isSelected')))
  })

  it('open export panel', function () {
    return openJobsPanel('Export')
  })
})
