require('babel-register')({})

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

const URL = 'http://localhost:8080/'

const browserDriverConfig = {
  chrome: { driver: 'selenium-webdriver/chrome', pathModule: 'chromedriver' },
  firefox: { driver: 'selenium-webdriver/firefox', pathModule: 'geckodriver' }
}

const browserName = 'chrome' // 'firefox'
const webdriver = require('selenium-webdriver')
const browserDriver = require(browserDriverConfig[browserName].driver)
const path = require(browserDriverConfig[browserName].pathModule).path
const { By } = webdriver

if (browserName === 'chrome') {
  // Note these calls are chrome-specific
  const service = new browserDriver.ServiceBuilder(path).build()
  browserDriver.setDefaultService(service)
}
if (browserName === 'firefox') {
}

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000

describe('Home Page', function () {
  // var suite = this
  beforeEach(function () {
    if (USE_SAUCE) {
      // run tests using travis+sauce
      const caps = {
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: browserName
      }

      this.browser = new webdriver.Builder()
      .withCapabilities(caps)
      .usingServer(`https://${username}:${accessKey}@ondemand.saucelabs.com/wd/hub`)
      .build()
    } else {
      // run tests locally if when not using travis+sauce
      this.browser = new webdriver.Builder()
      .withCapabilities({browserName})
      .build()
    }
  })

  afterEach(function (done) {
    if (USE_SAUCE) {
      const title = 'Home Page' // TODO: get test name
      const passed = true // TODO: get test result

      this.browser.quit()

      // TODO: get this reporting status back to Sauce
      // TODO part 2: report the actual test result here
      // (The Job ID is probably wrong)
      saucelabs.updateJob(process.env.TRAVIS_JOB_NUMBER, {
        name: title,
        passed: passed
      }, done)
    } else {
      this.browser.quit()
      done()
    }
  })

  it('should have a header', function () {
    return this.browser.get(URL)
    .then(_ => this.browser.findElement(By.css('.auth-logo')))
    .then(el => el.getAttribute('class'))
    .then(attr => expect(attr).toMatch(/auth-logo/))
  })
})
