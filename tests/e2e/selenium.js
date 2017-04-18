// require('babel-register')({})

/*
This provides utilities for selenium tests, normally included by a jest test file

But you can run selenium manually and use the node REPL like so:

// start node & launch browser:
cat <(echo "var selenium = require('./tests/e2e/selenium.js')") - | ./node_modules/babel-cli/bin/babel-node.js --presets node6

// ... do your thing ... examples:

selenium.clickSelector(By.css('.Suggestions-search');0
driver.findElement(By.xpath(`//*[contains(text(), '_selenium_1490203108449')]`)).then(_=>'yes',_=>'no').then(console.log);0
driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '_selenium_1490203108449')]`))).then(e=>{ e.click(); return 'yes'},_=>'no').then(console.log);0

// exit gracefully:
quit()
*/

const DEBUG = true

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
      browserName: browserName,
      screenResolution: "1024x768"
    }

    driver = new webdriver.Builder()
    .withCapabilities(caps)
    .usingServer(`https://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`)
    .build()
  } else {
    // run tests locally if when not using travis+sauce
    driver = new webdriver.Builder()
    .withCapabilities({browserName, screenResolution: "1024x768"})
    .build()
  }

  driver.then(_ => driver.manage().window().setSize(1024,768))

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
        // DEBUG && console.log('waitForIdle', {idle})
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
  .then(_ => driver.findElement(By.css('input[name="eula"]')).click())
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
// ----------------------------------------------------------------------
// wait until an element is visible (or timeout)
export function getSelectorVisible (by) {
  return driver.findElement(by).then(ele => ele.isDisplayed(), _ => false)
}

// ----------------------------------------------------------------------
// assert (expect) that an element is visible
// if not, the selector (by string) is displayed in the error message
export function expectSelectorVisibleToBe (goal, by) {
  return driver
  .then(_ => { DEBUG && console.log(`checking for ${by.toString()} visible=${goal}`) })
  .then(_ => driver.findElement(by))
  .then(
    ele => ele.isDisplayed(), // element found
    _ => false // element not found
  )
  .then(isDisplayed => {
    expect(JSON.stringify({ selector: by.toString(), isDisplayed }))
     .toBe(JSON.stringify({ selector: by.toString(), isDisplayed: goal }))
    return isDisplayed
  })
}

// ----------------------------------------------------------------------
// wait until an element isVisible == goal (or timeout)
export function waitForSelectorVisibleToBe (goal, by, optTimeout) {
  return driver
  .then(_ => { DEBUG && console.log(`waiting for ${by.toString()} to be visible=${goal}`) })
  .then(_ => driver.wait(_ => getSelectorVisible(by).then(is => is === goal), optTimeout, `timeout waiting for ${by.toString()} to visible=${goal}`))
  .then(_ => expectSelectorVisibleToBe(goal, by))
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// assert (expect) that a webdriver WebElement is visible
// elementName is whatever string you want to pass to identify
// this element in the error message & make it easy to fix
export function expectElementVisibleToBe (goal, element, elementName) {
  return driver
  .then(_ => element.isDisplayed())
  .then(isDisplayed => {
    DEBUG && (console.log(`checking for visible ${elementName} (isDisplayed: ${isDisplayed})`))
    expect(JSON.stringify({ elementName, isDisplayed }))
     .toBe(JSON.stringify({ elementName, isDisplayed: goal }))
    return isDisplayed
  })

  // This is the intent above, but jest's toMatchObject function
  // is not there, despite the docs https://github.com/facebook/jest/issues/2195
  // .then(isDisplayed => expect({isDisplayed, elementName})
  //   .toMatchObject({isDisplayed:true, elementName}))
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// wait until an element is Enabled (or timeout)
export function getSelectorEnabled (by) {
  return driver.findElement(by).then(ele => ele.isEnabled(), _ => false)
}

// ----------------------------------------------------------------------
// assert (expect) that a selector is Enabled
// if not, the selector is displayed in the error message
export function expectSelectorEnabledToBe (goal, by) {
  return driver
  .then(_ => driver.findElement(by))
  .then(
    ele => ele.isEnabled(), // element found
    _ => false // element not found
  )
  .then(isEnabled => {
    DEBUG && console.log(`checking for enabled ${by.toString()} (isEnabled: ${isEnabled})`)
    expect(JSON.stringify({ selector: by.toString(), isEnabled }))
     .toBe(JSON.stringify({ selector: by.toString(), isEnabled: goal }))
    return isEnabled
  })
}

// ----------------------------------------------------------------------
// wait until an element isVisible == goal (or timeout)
export function waitForSelectorEnabledToBe (goal, by, optTimeout) {
  return driver
  .then(_ => { DEBUG && console.log(`waiting for ${by.toString()} to be enabled=${goal}`) })
  .then(_ => driver.wait(_ => getSelectorEnabled(by).then(is => is === goal), optTimeout, `timeout waiting for ${by.toString()} to be enabled=${goal}`))
  .then(_ => expectSelectorEnabledToBe(goal, by))
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// wait until an element is selected (or timeout)
export function getSelectorSelected (by) {
  return driver.findElement(by).then(ele => ele.isSelected(), _ => false)
}

// ----------------------------------------------------------------------
// assert (expect) that a selector is selected
// if not, the selector is displayed in the error message
export function expectElementSelectedToBe (goal, by) {
  return driver
  .then(_ => { DEBUG && console.log(`checking for ${by.toString()} to be selected=${goal}`) })
  .then(_ => driver.findElement(by(selector)))
  .then(
    ele => ele.isSelected(), // element found
    _ => false // element not found
  )
  .then(isSelected => {
    expect(JSON.stringify({ selector: by.toString(), isSelected }))
     .toBe(JSON.stringify({ selector: by.toString(), isSelected: goal }))
    return isSelected
  })
}

// ----------------------------------------------------------------------
// wait until an element is selected (or timeout)
export function waitForSelectorSelectedToBe (goal, by, optTimeout) {
  return driver
  .then(_ => { DEBUG && console.log(`waiting for ${by.toString()} to be selected=${goal}`) })
  .then(_ => driver.wait(_ => getSelectorSelected(by).then(is => is === goal), optTimeout, `timeout waiting for ${selector} to be selected=${goal}`))
  .then(_ => expectElementSelectedToBe(goal, by))
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
export function doesElementHaveClass (element, className) {
  return element.getAttribute('class')
  .then(classes => new RegExp('\\b' + className + '\\b').test(classes))
}

// ----------------------------------------------------------------------
export function doesSelectorHaveClass (by, className) {
  return driver.findElement(by).then(ele => doesElementHaveClass(ele, className))
}

// ----------------------------------------------------------------------
export function expectElementHasClassToBe (goal, element, elementName, className) {
  return doesElementHaveClass(element, className).then(hasClass => {
    expect(JSON.stringify({ elementName, hasClass }))
      .toBe(JSON.stringify({ elementName, hasClass: goal }))
    return hasClass
  })
}

// ----------------------------------------------------------------------
export function expectSelectorHasClassToBe (goal, by, className) {
  return doesSelectorHaveClass(by, className).then(hasClass => {
    expect(JSON.stringify({ by: by.toString(), hasClass }))
      .toBe(JSON.stringify({ by: by.toString(), hasClass: goal }))
    return hasClass
  })
}

// ----------------------------------------------------------------------
export function waitForElementHasClassToBe (goal, element, elementName, className, optTimeout) {
  return driver
  .wait(_ => doesElementHaveClass(element, className).then(has => has === goal),
    optTimeout, `waitForElementHasClassToBe timeout ${elementName} ${className} ${{goal}}`)
  .then(_ => expectElementHasClassToBe(goal, element, elementName, className))
}

// ----------------------------------------------------------------------
export function waitForSelectorHasClassToBe (goal, by, className, optTimeout) {
  return driver
  .wait(_ => doesSelectorHaveClass(by, className).then(has => has === goal),
    optTimeout, `waitForSelectorHasClassToBe timeout ${by.toString()} ${className} ${{goal}}`)
  .then(_ => expectSelectorHasClassToBe(goal, by, className))
}

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
export function clickSelector (by) {
  return expectSelectorVisibleToBe(true, by).then(_ => driver.findElement(by).click())
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

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
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
