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

#### Adding & Removing Dependencies

For stability, we use the 'npm shrinkwrap' feature to version-lock all packages.

To add a new package:

- npm install normally. Make sure to use an exact version number in package.json
-- Make sure to use an exact version and not a range. For example use "axios": "0.14.0" rather than "axios": "0.14.0^"
-- We do not want versions to automatically upgrade. We want to upgrade packages explicitly. Automatic upgrades have broken the build unexpectedly.
-- Info on version number syntax here: https://github.com/npm/node-semver
- npm shrinkwrap --dev
- Manually remove the top-level "fsevents" block from npm-shrinkwrap.json, if it exists.

To remove a package:

- Remove the package line from package.json
- Remove the top-level entry for that package from npm-shrinkwrap.json
- Reinstall packages: npm cache clean; rm -rf node_modules; npm install

To upgrade packages:

- Set desired versions in package.json
- rm npm-shrinkwrap.json
- Reinstall packages: npm cache clean; rm -rf node_modules; npm install
- npm shrinkwrap --dev
- Manually remove the top-level "fsevents" block from npm-shrinkwrap.json, if it exists.

## Code Style

### Javascript

The one and only:

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

### CSS/SCSS

There are many different styles of CSS in the code base. That's changing, we'd like to use a [BEM-inspired](getbem.com/introduction/) standard going forward. Example class names could look
like:

```scss
.ImageThumb__fan-stack {
  // Stuff
}

.ImageThumb__fan-stack--disabled {
  // Stuff
}
```

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

The first time you run the dev server you'll need to generate a certificate.
```
npm run dev-https-cert
```

From then on you can start the dev server by running the following.
```
npm run dev-https
```

Once the build is complete you can access the server at [https://localhost:8081](https://localhost:8081). 
You'll need to connect to a live environment by filling out the "Archivist" field on the login page. Input the domain name 
of a running environment (i.e. staging.pool.zorroa.com or localhost:8066) and check the "SSL" box (assuming the archivist is using TLS).


#### Remote debugging

Here's the entire process: I start my curator. Then I use ssh -R 8081:localhost:8081 computeruser@shub.zorroa.com, and leave that running in a shell. It'll stay exposed as long as ssh is connected. Then I tell Juan to visit shub.zorroa.com:8081, and he will see & use the version of curator on my laptop.

#### Fonts

Make sure you install all the fonts in the [./src/assets/fonts](https://github.com/Zorroa/zorroa-js-curator/tree/master/src/assets/fonts) directory. It's not strictly needed for running, but trust us, it'll make your life easier.

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

### Selenium Testing

We use Selenium to run integration tests that click buttons and test for result conditions.
Selenium uses an OpenVPN grid called zorroa-shub, which is different than the main zorroa VPN.
Any machine on this VPN is a potential Selenium grid node. You can start and stop the Selenium
grid using the scripts in tests/selenium. The scripts in here will copy themselves to a remote
grid node and start up the driver.

To debug the Selenium grid:

* You can view the status of the Selenium hub with tests/selenium/openHub.sh which opens in your last browser window
* Start TeamViewer and open up a window on the grid node.
** The password is in LastPass
** You can watch tests running on this TeamViewer shell and verify that the driver is loaded
* First run the tests entirely locally, without using Selenium using `./node_modules/.bin/jest e2e`
** You can isolate tests by using, e.g. `./node_modules/.bin/jest folder-dnd`
** You can further isolate tests by skipping them by changing it() to xit()
* The run the test locally but using the Selenium grid using `npm run test`
** You can do the same sort of regex scoping as with jest
* Then run the test on Travis by pushing a commit to GH and checking on https://travis-ci.com/Zorroa/zorroa-js-curator

#### To update the chromium Driver

To update to a new chrome driver after updating Chrome on the grid machines:

* Update tests/selenium/startNode.sh CHROMEDRIVER_VERSION
* Update package.json
* Try to shrinkwrap again

The Chromium driver is run after copying startNode.sh to the remote machine and running it.
On OSX, there should be a gear in the status bar that cycles until the driver is loaded.

#### Configuring t<version>.pool.zorroa.com

The jest testing system uses the repository in, e.g. t39.pool.version.com to run unit tests.
After importing the standard test repository:

* Add a selenium user with the appropriate password (see tests/e2e/selenium.js)
* Add a simple import for the selenium user which can just have all the assets.
* Add the following permissions to the selenium user: administrator, developer

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
-- For example, if you load a page and try to click something on it immeidately, it may not be created or visible or ready on the first frame. Wait until it has been located and is visible, e.g., see waitForElementVisible()
- Use assertions liberally, e.g., Jest's expect(). Tests should fail quick & early.
- selenium.js: factored test utility functions, some specific to Zorroa.
-- `login()` / `logout()` -- Logs into a Zorroa app. login() logs out first, use this whenever you need to have a fresh session.
-- `waitForIdle()` -- Wait for any pending server requests to complete
-- `waitForElementVisible()` -- Wait until the given css selector is visible
- api.js: functions that the tests are allowed to call directly.
- Jest tests run on Sauce labs serially. Parallel currently breaks.
- You will see any console.log() calls made from the test.js file in your shell.
- use api.log(),api.getLog() to see app side debug prints in Selenium tests.
-- console.log() calls made from the app are absorbed & hidden.
- Take care not to break promise chains accidentally. (Information about how Selenium handles promises, with lots of examples here: http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html) Here are some bugs I've introduced accidentally:
-- I've used Selenium's convenient promise manager, and discovered that thrown exceptions and errors sometimes get swallowed by Jest, and cause the test to hang until timeout. This is very undesirable; we want errors to propagate quickly and give informative feedback. We also pay for time spent in Saucelabs tests, so timeouts are expensive.
--- Use the verbose form of promises and return a huge explicit promise chain, don't use the webdriver's syntactic sugar. (BTW, webdriver's promise manager is deprecated anyway.)
-- I've forgetten to return a promise in a test (the 'it' function)
--- symptom: browser doesn't quit after test
--- symptom: text printing after test results print
-- I've messed up caching & function call order. As a convenience, most functions of ours & webdriver's will implicitly wait on driver.then(). But I'm learning to be careful because using that convenient syntax has dangers. Static parameters are fine, but when passing variables, it's easy to accidentally make the call before your variable has resolved. Note that use of webdriver's promise manager contributes to this issue.
    --- Incorrect:
    ```
    let url
    driver.getCurrentUrl().then(u => { url = u })
    selenium.waitForUrl(`${url}signin`) // "url" passed before being assigned
    ```

    -- Correct:
    ```
    let url
    driver.getCurrentUrl().then(u => { url = u })
    driver.then(_ => selenium.waitForUrl(`${url}signin`)) // "url" passed after being assigned
    ```

    -- Preferred:
    ```
    let url
    driver.getCurrentUrl().then(u => { url = u })
    .then(_ => selenium.waitForUrl(`${url}signin`)) // "url" passed after being assigned
    ```

- When resolving with a value, you must chain .then directly to retrieve the value, NOT driver.then(). Note that use of webdriver's promise manager contributes to this issue.
    -- Incorrect:
    ```
    driver.findElement(By.css('.class'))
    driver.then(ele => { ... }) // ele will be a promise, not an element
    ```

    -- Correct:
    ```
    driver.findElement(By.css('.class'))
      .then(ele => { ... }) // ele will be an element
    ```

### Running Zorroa Grid tests manually:
```
npm test e2e
```

- `npm test` accepts a pattern argument to filter which tests to run.

### Running Selenium tests locally:
```
node_modules/.bin/jest e2e
```

- `jest` accepts a pattern argument to filter which tests to run.
- Use `npm test e2e` to run only tests/e2e/* (Selenium) tests
- Use `./node_modules/.bin/jest table` if you want to run just the table test, without the lint or code coverage passes. Useful for iterating more quickly.

### Running Sauce Labs tests manually:

- Download [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy), put it in the project tmp/ dir, if you want
- Launch util/sauce to run any Selenium tests you want, for example:

```
> util/sauce

...
18 Jan 17:52:21 - Sauce Connect is up, you may start your tests.
Enter test to run (blank to exit):work
running tests that match 'work'

RUNS  tests/e2e/workspace.test.js
```

- Monitor test results in the [Sauce Labs tests dashboard](https://saucelabs.com/beta/dashboard/tests)
-- Clicking on the test, then navigating to the "Watch" tab will display the test's browser screen real-time.

### Adding a node to the Zorroa Grid

Here's how to spin up a new mac mini node machine & add it to our grid

```
Install teamViewer
  Turn off Actions | lock on session end
```

```
Install tunnelBlick
  Add selenium vpn keys & connect to the vpn (vpn keys are in tests/selenium/zorroa-openvpn-client.tar.gz)
  Connect when tunnelblick launches
  Don't route all traffic
  Do connect to vpn on startup
  Keep connected
  Don't disconnect when sleeping
  Do reconnect when waking
  Don't disconnect when user switches out
  Do reconnect when user switches in
```

```
Install java
  Install Java SE Development Kit 8 (NOT the regular jre)
  http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html
```

```
Set mac to auto-login to user account zorroa (to faciliate restarts via teamviewer)
  Preferences | Users & Groups | Login Options
Set power save settings to not sleep
  Preferences | Energy Saver
Disable login password (TODO: this is probably not needed)
  System Preferences | Security & Privacy | Turn off require password
Schedule a nightly restart for 3am
  System Preferences | Energy Saver | Schedule...
```

```
Turn on remote login (ssh access) and copy ssh keys to the machine:
  HOST=10.8.0.3 # REPLACE IP with the correct host IP - use ifconfig on the new machine
  cd tests/selenium # (Curator repo)
  chmod 600 id_rsa_zorroa_*
  chmod 644 id_rsa_zorroa_*.pub
  ssh-copy-id -i id_rsa_zorroa_selenium_node zorroa@$HOST
  # does the node need to have any private keys? maybe not # scp id_rsa_zorroa_selenium_node* zorroa@$HOST:~/.ssh/
  ssh zorroa@$HOST -i id_rsa_zorroa_selenium_node # make sure it works - this should not ask for a password
  ./startNodeOnHost.sh $HOST
  ./sshNodeHost.sh $HOST 'touch ~/.zorroa-grid' # enable this node; startAllNodes.sh looks for this file
```

```
[Mac only & temporary] Create a login task in Automator set it to launch on login
  Start Automator.
  Create a new file, select "Application".
  Click "Show library" in the toolbar (if hidden)
  Add "Run shell script" (from the Actions/Utilities)
  Set the script to "/Users/zorroa/Desktop/selenium/startNode.sh"
  Save the file to "startSeleniumOnLogin" in the Desktop/selenium folder
  Go to System Preferences -> Accounts -> Login items
  Add the new app: ~/Desktop/selenium/startSeleniumOnLogin
  Restart & test to make sure the node connects automatically.
```

mac mini user account password: z0rr0@12

teamViewer remote control non-rotating password
EatGrapes!

teamViewer login:
selenium@zorroa.com / selZorTeam248$

### Restarting the Zorroa Grid hub

There is an ansible playbook to deploy shub.zorroa.com
To restart shub, use the AWS console

### Restarting the Zorroa Grid nodes

This will start or restart nodes on all available IP addresses connected to the Selenium VPN, excluding the hub and your own machine.

```
tests/selenium/startAllNodes.sh
```

To stop all nodes:

```
tests/selenium/startAllNodes.sh
```

### Grid notes

To switch Travis builds to use Sauce instead of the Zorroa grid, look for Sauce instructions in runNpmTest.sh & .travis.yml.

List all nodes on the vpn: listVpnNodes.sh
List all nodes registered with the hub: listGridNodes.sh
Open the hub in your favorite browser: openHub.sh
ssh into a node machine: sshNodeHost.sh <vpn ip>

Selenium & Grid resources:

http://elementalselenium.com/tips/70-grid-extras
http://elementalselenium.com/tips
https://github.com/groupon/Selenium-Grid-Extras


Troubleshooting

"Driver info: driver.version: unknown" exception
This one is dogging me. It seems related to how many tests I try to run in parallel, turning down the number of workers has seemed to help, but it's not always reproducible. I suspect somewhere in this pipeline is some kind of max connection limit -- I'm not sure if it's ssh, or the vpn, or jest, or webpack dev server, or selenium.

One of the minis was saying 'connection refused' during tests. Tunnelblick's connection had gone bad.

Teamviewer doesn't let you past the password: switch back to the teamviewer app while the login screen is still hung, and double-click the machine to login again. That should clear it up.

When running npm test locally, if your local web server is up and running and the test still complains it's not running: killall ssh & try again.

Sometimes it seems like connecting my local machine to the vpn causes the node machines to reconnect using a different IP address. Run openHub & if the hub console shows one or more machines failing to connect, then stop & restart all nodes. Another way to check is to run listVpnNodes & listGridNodes and make sure they match; if they don't then restart the nodes.

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

How a deploy gets to our users:

1. Once all tests and CI build jobs pass, and the pull request has been approved, merge in to master.
1. Every week or so (maybe soon every night), build a RPM of server+curator and install on non-production servers for testing (TODO, reference the documentation for this process)
1. Work with Amber & Matt to coordinate a release
1. Work with Ken, Juan, Amber, and Grue to test manually the bits we don’t test in Selenium
1. Build and test RPMs again, push to one or more customer machines.

Sometimes patches need to happen. If that occurs: we will cherry pick that commit into the 0.x branch and cut 0.x.1.

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

Our project will run in most standard JavaScript editors, including Atom
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
