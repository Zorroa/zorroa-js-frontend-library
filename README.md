# JS Curator

## Dependency assumptions

1. You will be required to use node v6.* for this app.  Download it [here](https://nodejs.org/en/)
1. Install eslint globally `npm install -g eslint` in order to use the cli in the terminal.  You may have to do prefix this command with `sudo` depending on how you have your computer setup.

## Install the app and its dependencies using your terminal

Clone the repo from Github

### Project Dependencies

Our project has a lot of smaller modules of code installed to help us do great things.  These packages are all recorded in the `package.json` file.  There are two sections in here to take note of: dependencies and devDependencies.  Dependencies are third party libraries required to run the actual project, while devDependencies are third party libraries required to work on the project.

Run `npm install` from the project root using your terminal.  This command will use the `package.json` file to install all project dependencies and their dependencies into a directory called `node_modules`.  This directory is not in version control.  Everyone will have to perform this install.  **Note:** A common error people encounter when working in a front end application is a failure to perform an install after pulling in updates from a merge.

You can view the first level dependencies by running `npm list -g --depth 0`.  Depth here is the nesting level.  Try a number like 10 to see the full dependency chain.  It is important to note that while it looks like a tree when running this command, the install is flat and will make your `node_modules` directory look completely terrifying.

## Code Style

The one and only:

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Starting the App

Another thing we get with this type of project is the ability to use our `package.json` file to serve as the conductor for the application.  This file has the ability to serve as the entry point for all of our actions using npm scripts.  These are located in scripts section.

Scripts that are natively apart of the node env can be directly called:

```
$ npm start
$ npm test
```

We can also write custom scripts:

```
$ npm run dev
$ npm run test:unit
$ npm run test:lint
```

## Running the project

In order to run the project you must do the previous steps for dependency installations.

There are two different modes this project can be run in: __dev mode__ and __static mode__.

### Dev mode

Dev mode is for the typical daily workflow and has live reloading enabled. It does not actually build into a directory, it runs the project though a dev server that uses the files in your working tree.

```
npm run dev # will run with hot reloading on a special server
```

### Static mode

Static mode is for testing the static build before submitting pull requests or deploying. Static mode bundles code & assets using our production settings into the bin directory, then serves that directory using a node server.  The bin/ directory is the final product and can be deployed to a server.

Since a static build is what gets deployed, it is highly recommended that you test a static build before submitting a pull request.

```
npm run build # create static build in bin/
npm start     # serve the static content in bin/
```

The static PROD build config assumes that an archivist server is running on the same host as the web server. This is how production machines will operate, with the web server and the archivist on the same host. If you need to test a static web server using a remote archivist, you can use the PRODLOCAL build config by running:

```
npm run build-prodlocal # build in bin/, allow remote archivist
npm start               # start web server, serve bin/
```

### Troubleshooting & possible errors

##### Server Hang

Sometimes the live reloading or a node server may hang (you did not close it).  You will get an error similiar to this `EADDRINUSE`.  A simple solution to this usually will be to run `killall node`.  It sounds worse than it is.

One of the first things I do I am getting node errors is clean house.  We have a special script to delete all dependencies from your project and from your computers cache the reinstall them: `npm run purge`

##### "Insecure Connection" errors

If you see errors like this in your console:
https://disney-cors:8066/api/v1/folders/0/_children Failed to load resource: net::ERR_INSECURE_RESPONSE

Then refresh your SSH certificate by visiting https://disney-cors:8066/gui. You should get a privacy warning. Continue by opening the "Advanced" tab, and proceeding to the site. You should arrive at the login screen, and one you log in, your certificate will be refreshed and you should be able to log in and use Curator again.

## Testing

You can run the tests by executing the following command in your terminal: `npm test`.  This will run the entire test suite.

Tips for making testing quicker & easier:

- `npm run test:watch`
  - Run the tests and have them watch for changes. This is super useful when writing your tests.
- `npm test <name>`
  - Runs all tests matching `<name>`. For example: "`npm test home`" will run only homePage.test.js

### Resources for writing tests:

- Test runner: [Jest](https://facebook.github.io/jest)
- Browser tests: [Selenium](http://docs.seleniumhq.org/)
- [Selenium Webdriver API](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)
- Continuous Integration: [TravisCI](https://travis-ci.com/Zorroa/zorroa-js-curator/)
- Cloud browser automation: [SauceLabs](https://saucelabs.com/beta/archives)
- React component testing: [Enzyme](http://airbnb.io/enzyme/)
- [Writing react tests](https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md)
- [End to End (e2e) Testing React Apps With Selenium WebDriver And Node.js is Easier Than You Think](http://marmelab.com/blog/2016/04/19/e2e-testing-with-node-and-es6.html)
- [Using Sauce Labs with Travis CI](https://docs.travis-ci.com/user/sauce-connect/)

### Tips for writing Selenium tests:

- Never use sleep(), hardcoded amounts of time are extremely brittle
- Use explicit waits liberally (for DOM conditions or events)
-- For example, if you load a page and try to click something on it immeidately, it may not be created or visible or ready on the first frame. Wait until it has been located and is visible.
-- You will probably have to write app code to help the tests understand how to wait whenever the app makes server calls.
- Use assertions liberally, e.g., Jest's expect(). Tests should fail early.
-- Especially after a wait, make sure a test fails as early as possible, and with as specific a message about what went wrong as possible.
-- I usually pair every explicit wait with an assert/expect using the same condition. Remember any wait will time out and continue when the wait condition isn't met.
- Factor common interactions into reusable pieces. (Duh?) Lots of people are calling this the ["page objects pattern"](http://docs.seleniumhq.org/docs/06_test_design_considerations.jsp#page-object-design-pattern).
- selenium.js contains some factored test utility functions, some specific to Zorroa. api.js contains frontend app-side functions that the tests are allowed to call. Use them. Add new ones! Examples:
-- `login()` / `logout()` -- Logs into a Zorroa app. login() logs out first, use this whenever you need to have a fresh session. (Will matter more when we have multiple user accounts.)
-- `waitForAssetsCounterChange()` -- Wait for new search query results
-- `waitForJsFnVal()` -- Wait until the given function returns the given value
-- `expectCssElementIsVisible()` -- Wait until the given css selector is visible
- When Jest tests run on Sauce labs in parallel, they break, so Jest has been set to run tests serially. TODO: figure out how to run tests in parallel.
- You will see any console.log() calls made from the test.js file in your shell.
- console.log() calls in the app are absorbed & hidden. Look at api.js:log(),getLog() if you need to see debug prints from the app in your Selenium tests.

### Running Selenium tests manually:

- `npm test` and `jest` accept a pattern argument to filter which tests to run.
- Use `npm test e2e` to run only tests/e2e/* (Selenium) tests
- Use `./node_modules/.bin/jest table` if you want to run just the table test, without the lint or code coverage passes. Useful for iterating more quickly.

### Running Sauce Labs tests manually:

- Download [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy), put it in the project tmp/ dir, if you want
- Set env vars to connect to sauce. (copy & paste line below into your shell; our Selenium tests automatically use Sauce when these are defined, and run Selenium tests locally when they aren't)

```
export SAUCE_USERNAME=zorroasauce; export SAUCE_ACCESS_KEY=f6c35e63-e19a-4575-be77-b49748e98bd6
```

- In the same shell, launch Sauce Connect in the background

```
tmp/sc-4.4.2-osx/bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY &
```

- In the same shell, run any Selenium tests you want
- Monitor test results in the [Sauce Labs tests dashboard](https://saucelabs.com/beta/dashboard/tests)
-- Clicking on the test, then navigating to the "Watch" tab will display the test's browser screen real-time.


## Deploying the project

```
# rebuild & publish the project
npm run deploy <version-type>

Where <version-type> is: "patch", "minor", or "major"
```

#### Details of the deploy process

Deploy is designed to be safe & reproducible, but it has some side effects and safety precautions to be aware of.

Before you deploy:

- Your working tree should be clean, with any changes to your current branch pushed. Deploy will fail if you have pending changes.
- Deploy will git pull - it may modify your working tree.
- Deploy will nuke & re-install all your npm packages, and also rebuild. This may take some time.

The **npm run deploy** command will:

- Rebuild
  - Run tests
  - Clean & rebuild
  - Clean & re-install npm packages
- Update the version number based on the given <version-type>
  - 'npm version' changes package.json
- Tag and push a commit
  - Tag is the patch version number prefixed with 'v', e.g., v0.1.2
  - Commit is pushed to the maj.min branch
- Deploy (not yet working)
  - [TODO] upload the static build in bin/ to the web server

##### Patch versions

A "patch" deploy must go into an existing minor version branch, which will be named with the major & minor version numbers only, e.g., "0.1". For example, if your current version is 0.1.2, then running "npm run deploy patch" will do the following:

- fail if you're not already sitting in branch "0.1"
- update the version number to 0.1.3
- create and push a new tag named "v0.1.3"
- push the version number change (in package.json) to the branch "0.1"

##### Minor versions

A "minor" or "major" deploy will increment the minor version number, and create a new maj.min branch during the deploy process. The changes will be submitted as a pull request on master. You will have to enter your github username and password the first time. For example, if your current version is 0.1.2, then running "npm run deploy minor" will do the following:

- update the version number to 0.2.0
- create and push a new branch named "0.2"
- create and push a new tag named "v0.2.0"
- create a pull request to merge branch 0.2 with master

## Development Tools

Our project will run in most standard JavaScript editors, including atom
and WebStorm.

You can set breakpoints and debug variables in Chrome, Firefox or
other browser debuggers. The build/webpack.dev.js file contains
additional debugging configuration for the transpiled code, specifically
the devtools setting, which controls the final compiled code style, and
the source map configurations, which allow you to map from the transpiled
code back to the original source files.

#### Plugins

* [Redux Dev Tools](https://github.com/gaearon/redux-devtools)
* [React Dev Tools](https://github.com/facebook/react-devtools)

#### Documentation

- [EMCAScript 6 New Features: Overview & Comparison](http://es6-features.org)
- [Redux docs](http://redux.js.org/)
- [react-redux API from GitHub Readme](https://github.com/reactjs/react-redux/blob/master/docs/api.md) with connect, mapStateToProp and mapDispatchToProp API
- [Axios HTTP framework](https://github.com/mzabriskie/axios) with examples for GET, POST, and other HTTP utilities
- [redux-form](http://redux-form.com/6.0.5/docs/GettingStarted.md/) with examples of each type of form
- [React property validation](https://facebook.github.io/react/docs/reusable-components.html)
- [React URL handling](https://blog.marvelapp.com/managing-the-url-in-a-redux-app/)

## Todo

- [ ] Test: Unit tests for redux reducers
- [ ] Test: Test coverage
- [ ] Document the planet
