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

```
npm run dev # will run with hot reloading on a special server
```

Dev mode is for the typical daily workflow and has live reloading enabled. It does not actually build into a directory, it runs the project though a dev server that uses the files in your working tree.

### Static mode

```
npm start # will run a build then serve the static content
```

Static mode is for testing the static build before submitting pull requests or deploying. Static mode bundles code & assets using our production settings into the bin directory, then serves that directory using a node server.  The bin directory is the final product and can be deployed to a server.

It is highly recommended that you run `npm run build` and test on the static server before submitting a pull requests.

### Troubleshooting & possible errors

##### Server Hang

Sometimes the live reloading or a node server may hang (you did not close it).  You will get an error similiar to this `EADDRINUSE`.  A simple solution to this usually will be to run `killall node`.  It sounds worse than it is.

One of the first things I do I am getting node errors is clean house.  We have a special script to delete all dependencies from your project and from your computers cache the reinstall them: `npm run purge`

##### "Insecure Connection" errors

If you see errors like this in your console:
https://disney-cors:8066/api/v1/folders/0/_children Failed to load resource: net::ERR_INSECURE_RESPONSE

Then refresh your SSH certificate by visiting https://disney-cors:8066/gui. You should get a privacy warning. Continue by opening the "Advanced" tab, and proceeding to the site. You should arrive at the login screen, and one you log in, your certificate will be refreshed and you should be able to log in and use Curator again.

## Testing

You can run the tests by executing the following command in your terminal: `npm test`.  This will run the entire test suite.  You can also use `npm run test:watch` to run the tests and have them watch for changes.  This is super useful when writing your tests.

#### [Jest](https://facebook.github.io/jest/) https://github.com/facebook/jest

We are using Jest to run our tests.  It is newer in the testing realm but it is a product from facebook.  So it all kind was built to play nice with each other.

#### [Enzyme](http://airbnb.io/enzyme/)

This is a product from AirBnB to allow us to do assertions on our react components!!!  This is the first good solution that I have really played with.  It is important to note that in the enzyme examples, they are using **not** using Jest for their assertions.

#### Helpful links

- [Writing react tests](https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md)

## Deploying the project

### Manually

- Make sure your working tree is clean and all commits are pushed

##### Minor version


```
# create a new branch
git checkout -b minor_$(date +%s%3N)
# bump the version number, creates a commit & tag
npm version minor -m "$USER deployed %s on $(date +%Y-%m-%d@%H:%M)"
# get the new version number
VERSION_PATCH=$(npm version | grep zorroa-js-curator | egrep -o '\d+\.\d+\.\d+')
VERSION_MAJMIN=$(echo $VERSION_PATCH | cut -f -2 -d.)
# rename our branch to version name
git branch -m v$VERSION_MAJMIN
# push our new branch
git push -u origin HEAD
# push the new tag that npm version created
git push origin v$VERSION_PATCH
# create a pull request (asks for github username/password first time)
hub pull-request
```

##### Patch (hotfix)

First make sure you're in the branch you want to patch.

```
git checkout <version-branch>
# e.g. v0.1 - the major.minor branch you want to patch
```

Now update the version number:

```
# bump the version number, creates a commit & tag
npm version patch -m "$USER deployed %s on $(date +%Y-%m-%d@%H:%M)"
# get the new version number
VERSION_PATCH=$(npm version | grep zorroa-js-curator | egrep -o '\d+\.\d+\.\d+')
VERSION_MAJMIN=$($VERSION_PATCH | cut -f -2 -d.)
# rename our branch to version name
git branch -m v$VERSION_MAJMIN
# push our new branch
git push -u origin HEAD
# push the new tag that npm version created
git push origin v$VERSION_PATCH
```

### Automated (in progress, may not work as expected yet)

```
# rebuild & publish the project
npm run deploy <version-type>

Where <version-type> is: "patch", "minor", or "major"
```

This command will perform a clean build, tag it with a new version number, and (TODO) push the build to the server.

Deploy automatically updates and stores the build's version number using the "npm version" command. The git repo will also be tagged with the version number for future reference, hotfixes, etc..

**NOTE**: Deploy is designed to be safe & reproducible, it has some safety precautions to be aware of.

- Your working tree *must* be clean, with any changes to your current branch pushed. Deploy will fail if you have pending changes.
- Deploy will git pull - it may modify your working tree.
- Deploy will nuke & re-install all your npm packages, and also rebuild. This may take some time.

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
