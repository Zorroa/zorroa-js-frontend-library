require('babel-register')({})

// http://seleniumhq.github.io/selenium/docs/api/javascript/index.html
// https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs

const URL = 'http://localhost:8080/'

const webdriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
// const firefox = require('selenium-webdriver/firefox')
const path = require('chromedriver').path
const { By, until } = webdriver

const service = new chrome.ServiceBuilder(path).build()
chrome.setDefaultService(service)

const driver = new webdriver.Builder()
  .withCapabilities(webdriver.Capabilities.chrome())
  .build()

describe('Home Page', () => {
  beforeEach(() => {
    driver.navigate().to(URL)
  })

  afterEach(() => {
    driver.quit()
  })

  it('should have a header', () => {
    driver.findElement(By.css('.header-logo'))
      .then(el => el.getAttribute('class'))
      .then(attr => {
        expect(attr).toBe('header-logo')
      })
  })
})
