// require('babel-register')({})

/*
This provides utilities for selenium tests, normally included by a jest test file

But you can run selenium manually and use the node REPL like so:

// start node & launch browser:
cat <(echo "var selenium = require('./tests/e2e/selenium.js')") - | ./node_modules/babel-cli/bin/babel-node.js --presets node6

// ... do your thing ... examples:

selenium.clickCssElement('.Suggestions-search');0
driver.findElement(By.xpath(`//*[contains(text(), '_selenium_1490203108449')]`)).then(_=>'yes',_=>'no').then(console.log);0
driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '_selenium_1490203108449')]`))).then(e=>{ e.click(); return 'yes'},_=>'no').then(console.log);0

// exit gracefully:
quit()
*/

const DEBUG = false

// selenium promise manager is deprecated; use this to start testing. also works in the shell
// process.env.SELENIUM_PROMISE_MANAGER = 0

// provide dummy versions of the jest deps in this file
// this is used for manual testing, i.e., when running this file directly from node w/o jest
const runningManually = (!global.expect)
global.jasmine = global.jasmine || {}
global.jest = global.jest || ({ autoMockOff: _ => {} })
global.expect = global.expect || (x => {
  return {
    toBe: y => { if (!(x == y)) console.error(`${x} is not ${y}`, new Error().stack) },
    toBeGreaterThan: y => { if (!(x > y)) console.error(`${x} is not greater than ${y}`, new Error().stack) },
    toBeLessThan: y => { if (!(x < y)) console.error(`${x} is not less than ${y}`, new Error().stack) }
  }
})

// ----------------------------------------------------------------------

var SauceLabs = require('saucelabs')

var username = process.env.SAUCE_USERNAME
var accessKey = process.env.SAUCE_ACCESS_KEY

var saucelabs

const USE_SAUCE = (username !== undefined)
if (USE_SAUCE) {
  saucelabs = new SauceLabs({
    username: username,
    password: accessKey
  })
}

// http://seleniumhq.github.io/selenium/docs/api/javascript/index.html
// https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs
// https://github.com/ndmanvar/JS-Mocha-WebdriverJS/blob/master/tests/sample-spec.js#L47-L50

export const BASE_URL = 'http://localhost:8080'

// let selenium tests run. jest's default is an unreasonable 5 seconds
jasmine.DEFAULT_TIMEOUT_INTERVAL = (DEBUG && !USE_SAUCE) ? 30000 : 90000

var allTestsPassed = true
var failedTests = []
var testStartDate = Date.now()
var testStopDate = Date.now()
var testRunTimeMS = 0

;(function _monitorTestResults () {
  if (!global.jasmineRequire) return
  // http://stackoverflow.com/a/33795262/1424242
  var MyReporter = function () { jasmineRequire.JsApiReporter.apply(this, arguments) }
  MyReporter.prototype = jasmineRequire.JsApiReporter.prototype
  MyReporter.prototype.constructor = MyReporter
  MyReporter.prototype.specDone = function (o) {
    if (o && o.failedExpectations && o.failedExpectations.length) {
      failedTests.push(o.description)
      allTestsPassed = false
    }
  }
  jasmine.getEnv().addReporter(new MyReporter())
})()

// pointer to the jest (jasmine) test suite, must be passed to startBrowserAndDriver
var suite = null

// ----------------------------------------------------------------------

export var driver = null

const browserDriverConfig = {
  chrome: { driver: 'selenium-webdriver/chrome', pathModule: 'chromedriver' },
  firefox: { driver: 'selenium-webdriver/firefox', pathModule: 'geckodriver' }
}

const browserName = 'chrome' // 'firefox'
export const webdriver = require('selenium-webdriver')
const browserDriver = require(browserDriverConfig[browserName].driver)
const path = require(browserDriverConfig[browserName].pathModule).path
const { By } = webdriver
// const { until } = webdriver

if (browserName === 'chrome') {
  // Note these calls are chrome-specific
  const service = new browserDriver.ServiceBuilder(path).build()
  browserDriver.setDefaultService(service)
}
if (browserName === 'firefox') {
}

// ----------------------------------------------------------------------
export function startBrowserAndDriver (_suite) {
  testStartDate = Date.now()

  jest.autoMockOff()

  suite = _suite
  expect(suite && !!suite.description).toBe(true)

  if (USE_SAUCE) {
    // run tests using travis+sauce
    const caps = {
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      build: process.env.TRAVIS_BUILD_NUMBER,
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      browserName: browserName
    }

    driver = new webdriver.Builder()
    .withCapabilities(caps)
    .usingServer(`https://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`)
    .build()
  } else {
    // run tests locally if when not using travis+sauce
    driver = new webdriver.Builder()
    .withCapabilities({browserName})
    .build()
  }

  return driver
}

// ----------------------------------------------------------------------
export function stopBrowserAndDriver () {
  return new Promise((resolve, reject) => {
    testStopDate = Date.now()
    testRunTimeMS = testStopDate - testStartDate

    if (!driver) return resolve()

    if (!USE_SAUCE) {
      driver.quit()
      driver = null
      return resolve()
    }

    driver.getSession()
    .then(session => {
      var sessionId = session.getId()
      var dateAndLocaleString = datems => [datems, (new Date(datems)).toLocaleString()]

      saucelabs.updateJob(sessionId,
        {
          name: `${process.env.TRAVIS_BUILD_NUMBER} ${suite.description} [${process.env.TRAVIS_PULL_REQUEST_BRANCH} -> ${process.env.TRAVIS_BRANCH}]`,
          tags: [ process.env.TRAVIS_PULL_REQUEST_BRANCH, process.env.TRAVIS_BRANCH ],
          passed: allTestsPassed,
          build: process.env.TRAVIS_BUILD_NUMBER,
          'public': 'team',
          'custom-data': {
            travis_build_id: process.env.TRAVIS_BUILD_ID,
            travis_build_num: process.env.TRAVIS_BUILD_NUMBER,
            travis_pr_branch: process.env.TRAVIS_PULL_REQUEST_BRANCH,
            failedTests: failedTests,
            startDate: dateAndLocaleString(testStartDate),
            stopDate: dateAndLocaleString(testStopDate),
            runTimeMS: testRunTimeMS
          }
        },
        function _updateJobDoneFn () {
          driver.quit()
          driver = null
          resolve()
        }
      )
    })
  })
}

// ----------------------------------------------------------------------
export function waitForUrl (expectedURL, optTimeout) {
  driver.then(_ => { DEBUG && console.log(`waitForUrl ${expectedURL}`) })
  driver.then(_ =>
    driver.wait(_ => {
      return driver.getCurrentUrl().then(url => {
        // console.log('waiting', url, expectedURL)
        if (url === expectedURL) return true
        return new Promise(r => setTimeout(_ => r(false), 100)) // if urls dont match, slow down
      })
    }, optTimeout, `waitForUrl timeout ${expectedURL}`)
  )

  return driver
}

// ----------------------------------------------------------------------
export function showLog () {
  return driver.executeScript('return window.zorroa.getLog()')
  .then(log => {
    if (DEBUG && log && log.length) console.log(log)
  })
}

// ----------------------------------------------------------------------
export function waitForBusy (optTimeout) {
  // Make sure we wait until a request has started
  return driver.wait(
    _ => {
      let busy
      return driver
      // .then(_ => new Promise(resolve => setTimeout(resolve, 200)))
      .then(_ => driver.executeScript('return window.zorroa.getRequestsSynced()'))
      .then(s => { busy = !s })
      // .then(_ => { DEBUG && console.log('waitForBusy', {busy}) })
      .then(_ => busy)
    }
    , optTimeout, 'waitForBusy timeout'
  )
}

// ----------------------------------------------------------------------
export function waitForIdle (optTimeout) {
  // Make sure we wait until the request is finished, wait for not busy
  return driver.then(_ => { DEBUG && console.log('waitForIdle') })
  .then(_ => driver.wait(
    _ => {
      return driver
      .then(_ => { return new Promise(resolve => setTimeout(resolve, 500)) })
      .then(_ => driver.executeScript('return window.zorroa.getRequestsSynced()'))
      .then(s => {
        const idle = !!s
        DEBUG && console.log('waitForIdle', {idle})
        return idle
      })
    }
    , optTimeout, 'waitForIdle timeout'
  ))
}

// ----------------------------------------------------------------------
export function waitForAssetsCounterChange (actionFn, optTimeout) {
  var assetsCounter = 0

  return driver
  .then(_ => driver.executeScript('return window.zorroa.getAssetsCounter()'))
  .then(ac => {
    assetsCounter = ac
    // DEBUG && console.log({assetsCounter})
  })

  .then(actionFn)

  .then(driver.wait(_ =>
    driver.executeScript('return window.zorroa.getAssetsCounter()').then(ac => {
      // DEBUG && console.log({ac, assetsCounter, ne: ac !== assetsCounter})
      return ac !== assetsCounter
    })
  ), optTimeout, 'waitForAssetsCounterChange timeout')
}

// ----------------------------------------------------------------------
// This function will call the named js function repeatedly until the return values changes
// Optional actions can be passed that run before or after the first js function call
// The optional pre action runs before the first js function call. It can return a promise if async
// Optional post action runs after the first js function call. Can return promise if async
export function waitForJsFnChange (jsFnName, optPreActionFn, optPostActionFn, optTimeout) {
  var jsFnFirstResult

  return driver
  .then(_ => { if (optPreActionFn) return optPreActionFn() })
  .then(_ => driver.executeScript(`return ${jsFnName}()`))
  .then(jsFnResult => {
    jsFnFirstResult = jsFnResult
    DEBUG && console.log({jsFnResult})
  })

  .then(_ => { if (optPostActionFn) return optPostActionFn() })

  .then(driver.wait(_ =>
    driver.executeScript(`return ${jsFnName}()`)
    .then(jsFnResult => {
      DEBUG && console.log({jsFnResult, jsFnFirstResult, ne: jsFnResult !== jsFnFirstResult})
      return jsFnResult !== jsFnFirstResult
    })
  ), optTimeout, `waitForJsFnChange (${jsFnName}) timeout`)
}

// ----------------------------------------------------------------------
// This function will call the named js function repeatedly
// until the return value equals the given expected result
export function waitForJsFnVal (jsFnName, jsFnExpectedValue, optTimeoutMS) {
  var count = 0
  return driver
  .then(driver.wait(_ => {
    DEBUG && (!(count % 30)) && console.log(`waitForJsFnVal executing ${jsFnName}()`)
    return driver.executeScript(`return ${jsFnName}()`)
    .then(jsFnResult => {
      DEBUG && (!(count % 30)) && console.log(`[waitForJsFnVal] ${jsFnName}`, {jsFnResult, jsFnExpectedValue, eq: jsFnResult === jsFnExpectedValue})
      count++
      return jsFnResult === jsFnExpectedValue
    })
  }), optTimeoutMS, `waitForJsFnChange (${jsFnName}) timeout`)
}

// ----------------------------------------------------------------------
export function logout () {
  // de-auth and log out
  driver.then(_ => { DEBUG && console.log('logout') })
  driver.get(`${BASE_URL}`).then(_ => driver.manage().deleteAllCookies())
  return driver
}

// ----------------------------------------------------------------------
export function login () {
  return logout()
  .then(_ => { DEBUG && console.log('loggin in') })
  .then(_ => driver.get(`${BASE_URL}/signin`))
  .then(_ => driver.executeScript('window.zorroa.setSeleniumTesting(true)'))
  .then(_ => driver.findElement(By.css('input[name="username"]')).sendKeys('admin'))
  .then(_ => driver.findElement(By.css('input[name="password"]')).sendKeys('z0rr0@12'))
  .then(_ => driver.findElement(By.css('input[name="host"]')).sendKeys('dev.zorroa.com'))
  .then(_ => driver.findElement(By.css('input[name="ssl"]')).isSelected())
  .then(isSelected => !isSelected && driver.findElement(By.css('input[name="ssl"]')).click())
  .then(_ => driver.findElement(By.css('.auth-button-primary')).click())
  .then(_ => waitForUrl(`${BASE_URL}/`, 15000))
  .then(_ => driver.getCurrentUrl())
  .then(url => { expect(url).toBe(`${BASE_URL}/`) })
  .then(_ => { console.log('logged in') })

  // // If there's a saved search from last session, then clear it
  // // [Started but temporarily disabled until we figure out
  // //  how to wait to determine whether search will be restored]
  // .then(_ => driver.wait(until.elementIsVisible(By.css('.Searchbar-search')), 15000))
  // .then(_ => driver.findElement(By.css('.Searchbar-clear')))
  // .then(
  //   function _elementFound (element) {
  //     console.log('got clear')
  //     return waitForAssetsCounterChange(_ => element.click())
  //   },
  //   function _elementNotFound () {
  //   /* no clear button means everything's ready */
  //     console.log('no clear')
  //   }
  // )
}

// ----------------------------------------------------------------------
// wait until an element is visible (or timeout)
export function getElementVisible (by, selector) {
  return driver.findElement(by(selector))
  .then((ele) => ele.isDisplayed(), () => false)
}

// ----------------------------------------------------------------------
// wait until a css selector is visible (or timeout)
export function getCssElementVisible (selector) {
  return getElementVisible(By.css, selector)
}

// ----------------------------------------------------------------------
// wait until an xpath selector is visible (or timeout)
export function getXpathVisible (selector) {
  return getElementVisible(By.xpath, selector)
}

// ----------------------------------------------------------------------
// wait until an element is visible (or timeout)
export function waitForCssElementVisible (selector, optTimeout) {
  return driver.wait(_ => getCssElementVisible(selector), optTimeout, `timeout waiting for ${selector} to be visible`)
  .then(_ => expectCssElementIsVisible(selector))
}

// ----------------------------------------------------------------------
// wait until an xpath selector is visible (or timeout)
export function waitForXpathVisible (selector, optTimeout) {
  return driver.wait(_ => getXpathVisible(selector), optTimeout, `timeout waiting for ${selector} to be visible`)
  .then(_ => expectXpathElementIsVisible(selector))
}

// ----------------------------------------------------------------------
// wait until a css selector is visible (or timeout)
export function waitForCssElementNotVisible (selector, optTimeout) {
  return driver.wait(_ => getCssElementVisible(selector).then(x => !x), optTimeout, `timeout waiting for ${selector} to not be visible`)
  .then(_ => expectCssElementIsNotVisible(selector))
}

// ----------------------------------------------------------------------
// wait until an xpath selector is visible (or timeout)
export function waitForXpathNotVisible (selector, optTimeout) {
  return driver.wait(_ => getXpathVisible(selector).then(x => !x), optTimeout, `timeout waiting for ${selector} to not be visible`)
  .then(_ => expectXpathElementIsNotVisible(selector))
}

// ----------------------------------------------------------------------
// assert (expect) that a selector is visible
// if not, the selector is displayed in the error message
export function expectSelectorIsVisible (by, selector) {
  return driver
  .then(_ => driver.findElement(by(selector)))
  .then(
    (ele) => ele.isDisplayed(), // element found
    () => { expect(selector).toBe('selector not found'); return false } // element not found
  )
  .then(isDisplayed => {
    DEBUG && console.log(`checking ${selector} (isDisplayed: ${isDisplayed})`)
    expect(JSON.stringify({ selector, isDisplayed }))
     .toBe(JSON.stringify({ selector, isDisplayed: true }))
    return isDisplayed
  })
}

// ----------------------------------------------------------------------
// assert (expect) that a css selector is visible
// if not, the css selector is displayed in the error message
export function expectCssElementIsVisible (selector) {
  return expectSelectorIsVisible(By.css, selector)
}

// ----------------------------------------------------------------------
// assert (expect) that a xpath selector is visible
// if not, the xpath selector is displayed in the error message
export function expectXpathElementIsVisible (selector) {
  return expectSelectorIsVisible(By.xpath, selector)
}

// ----------------------------------------------------------------------
// assert (expect) that a css selector is visible
// if not, the css selector is displayed in the error message
export function expectCssElementIsNotVisible (selector) {
  return getCssElementVisible(selector)
  .then(isDisplayed => {
    DEBUG && console.log(`checking ${selector} (isDisplayed: ${isDisplayed})`)
    expect(JSON.stringify({ selector, isDisplayed }))
     .toBe(JSON.stringify({ selector, isDisplayed: false }))
    return isDisplayed
  })
}

// ----------------------------------------------------------------------
// assert (expect) that a webdriver WebElement is visible
// elementName is whatever string you want to pass to identify
// this element in the error message & make it easy to fix
export function expectElementIsVisible (element, elementName) {
  return driver
  .then(_ => element.isDisplayed())
  .then(isDisplayed => {
    DEBUG && (console.log(`checking ${elementName} (isDisplayed: ${isDisplayed})`))
    expect(JSON.stringify({ elementName, isDisplayed }))
     .toBe(JSON.stringify({ elementName, isDisplayed: true }))
    return isDisplayed
  })

  // This is the intent above, but jest's toMatchObject function
  // is not there, despite the docs https://github.com/facebook/jest/issues/2195
  // .then(isDisplayed => expect({isDisplayed, elementName})
  //   .toMatchObject({isDisplayed:true, elementName}))
}

// ----------------------------------------------------------------------
// assert (expect) that a webdriver WebElement is visible
// elementName is whatever string you want to pass to identify
// this element in the error message & make it easy to fix
export function expectElementIsNotVisible (element, elementName) {
  return driver
  .then(_ => element.isDisplayed())
  .then(isDisplayed => {
    DEBUG && (console.log(`checking ${elementName} (isDisplayed: ${isDisplayed})`))
    expect(JSON.stringify({ elementName, isDisplayed }))
     .toBe(JSON.stringify({ elementName, isDisplayed: true }))
    return isDisplayed
  })

  // This is the intent above, but jest's toMatchObject function
  // is not there, despite the docs https://github.com/facebook/jest/issues/2195
  // .then(isDisplayed => expect({isDisplayed, elementName})
  //   .toMatchObject({isDisplayed:true, elementName}))
}

// ----------------------------------------------------------------------
export function doesElementHaveClass (element, className) {
  return element.getAttribute('class')
  .then(classes => new RegExp('\\b' + className + '\\b').test(classes))
}

// ----------------------------------------------------------------------
export function doesCssElementHaveClass (selector, className) {
  return driver.findElement(By.css(selector))
  .then(ele => doesElementHaveClass(ele, className))
}

// ----------------------------------------------------------------------
export function expectElementHasClass (element, elementName, className) {
  return doesElementHaveClass(element, className).then(hasClass => {
    expect(JSON.stringify({ elementName, hasClass }))
      .toBe(JSON.stringify({ elementName, hasClass:true }))
    return hasClass
  })
}

// ----------------------------------------------------------------------
export function expectCssElementHasClass (selector, className) {
  return doesCssElementHaveClass(selector, className).then(hasClass => {
    expect(JSON.stringify({ selector, hasClass }))
      .toBe(JSON.stringify({ selector, hasClass:true }))
    return hasClass
  })
}

// ----------------------------------------------------------------------
export function expectCssElementDoesntHaveClass (selector, className) {
  return doesCssElementHaveClass(selector, className).then(hasClass => {
    expect(JSON.stringify({ selector, hasClass }))
      .toBe(JSON.stringify({ selector, hasClass:false }))
    return hasClass
  })
}

// ----------------------------------------------------------------------
// wait until pass element has the class 'className'
// the elementName argument is only used for logging & errors
export function waitForElementToHaveClass (element, elementName, className, optTimeout) {
  driver.wait(_ => doesElementHaveClass(element, className),
    optTimeout, `waitForElementToHaveClass timeout ${elementName} ${className}`)
  driver.then(_ => expectElementHasClass(element, elementName, className))
  return driver
}

// ----------------------------------------------------------------------
export function waitForCssElementToHaveClass (selector, className, optTimeout) {
  driver.wait(_ => doesCssElementHaveClass(selector, className),
    optTimeout, `waitForCssElementToHaveClass timeout ${selector} ${className}`)
  driver.then(_ => expectCssElementHasClass(selector, className))
  return driver
}

// ----------------------------------------------------------------------
export function waitForCssElementToNotHaveClass (selector, className, optTimeout) {
  driver.wait(
    _ => {
      return doesCssElementHaveClass(selector, className).then(hasClass => !hasClass)
    },
    optTimeout, `waitForCssElementToNotHaveClass timeout ${selector} ${className}`)
  driver.then(_ => expectCssElementDoesntHaveClass(selector, className))
  return driver
}

// ----------------------------------------------------------------------
export function clickCssElement (selector) {
  return expectCssElementIsVisible(selector)
  .then(_ => driver.findElement(By.css(selector)).click())
}

// ----------------------------------------------------------------------
export function clickXpathElement (selector) {
  return expectXpathElementIsVisible(selector)
  .then(_ => driver.findElement(By.xpath(selector)).click())
}

// ----------------------------------------------------------------------
// TODO: have this check the open state; allow explicit open or close
export function getFolderNamed (folderName) {
  // Find the FolderItem-toggle attached to a FolderItem with a descendant matching the given text
  // http://stackoverflow.com/a/1390680/1424242
  const xpath = `//div[contains(concat(" ", @class, " "), " FolderItem ") and descendant::*[contains(text(), "${folderName}")]]`
  return driver.then(_ => { DEBUG && (console.log(`getFolderNamed ${folderName}`)) })
  .then(_ => driver.findElement(By.xpath(xpath)))
}

// ----------------------------------------------------------------------
// TODO: have this check the open state; allow explicit open or close
export function getTagNamed (tagName) {
  // Find the Metadata-item-toggle attached to a Metadata-item with a descendant matching the given text
  // http://stackoverflow.com/a/1390680/1424242
  const xpath = `//div[contains(concat(" ", @class, " "), " Metadata-item ") and descendant::*[contains(text(), "${tagName}")]]`
  return driver.then(_ => { DEBUG && (console.log(`getTagNamed ${tagName}`)) })
  .then(_ => driver.findElement(By.xpath(xpath)))
}


// ----------------------------------------------------------------------
// Get a whole bunch of elements at once.
// Returns an object of elements indexed by selector
export function findCssElements (selectors) {
  var elements = {}
  var proms = []

  selectors.forEach((selector, index) => {
    proms.push(
      driver.findElement(By.css(selector))
      .then(
        ele => { elements[selector] = ele }, // element found
        _ => { elements[selector] = null } // element not found
      )
    )
  })

  return Promise.all(proms).then(_ => elements)
}

// Setup global env when running manually
if (runningManually) {
  process.on('uncaughtException', function (err) {
    // handle the error safely
    console.error(err)
  })
  var cleanup = _ => {
    console.log('cleanup')
    if (global.driver) {
      return global.driver.then(_ => logout())
      .then(_ => stopBrowserAndDriver())
      .then(_ => { global.driver = null })
    }
  }
  process.on('exit', cleanup)
  process.on('SIGINT', cleanup)
  const { By, until, Key } = webdriver
  global.By = By
  global.until = until
  global.Key = Key

  global.driver = startBrowserAndDriver({ description: 'dummy suite' })
  driver.then(_ => login())
  global.quit = _ => { return cleanup().then(_ => process.exit()) }
  process.stdin.resume() // so the program will not close instantly
  require('util').inspect = function () { return '' } // prevent REPL from displaying return values -- I don't want to see Promises
}
