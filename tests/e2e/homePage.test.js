require('babel-register')({})
// import * as assert from 'assert'
import * as selenium from './selenium.js'
var driver
const { By } = selenium.webdriver

const DEBUG = true

describe('Home Page', function () {
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

  it('signin page should have a header and login form', function () {
    DEBUG && console.log('------ signin page should have a header and login form')
    // return the driver (a thenable) so that jest will wait
    return selenium.logout()

    .then(_ => driver.get(selenium.BASE_URL))

    // Make sure header image is there
    .then(_ => driver.findElement(By.css('.auth-logo')))
    .then(el => el.getAttribute('class'))
    .then(attr => expect(attr).toMatch(/auth-logo/))

    // Make sure we have username & password fields
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('input[name="username"]')))
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('input[name="password"]')))
  })

  it('forgot password should redirect to /forgot', function () {
    DEBUG && console.log('------ forgot password should redirect to /forgot')
    return selenium.logout()
    .then(_ => selenium.expectSelectorVisibleToBe(true, By.css('.auth-forgot')))
    .then(_ => driver.findElement(By.css('.auth-forgot')).click())
    .then(_ => driver.getCurrentUrl())
    .then(url => expect(url).toBe(`${selenium.BASE_URL}/forgot`))
  })

  it('user should be able to log in', function () {
    DEBUG && console.log('------ forgot password should redirect to /forgot')
    return selenium.login()
    .then(_ => selenium.logout())
    .then(_ => selenium.testJSErrors())
  })

})
