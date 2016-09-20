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

## Testing

### Unit tests

### Component Tests

[Jest](https://facebook.github.io/jest/) https://github.com/facebook/jest

We are using Jest to run our tests.  It is newer in the testing realm but it is a product from facebook.  So it all kind was built to play nice with each other.

- [Enzyme](http://airbnb.io/enzyme/)

This is a product from AirBnB to allow us to do assertions on our react components!!!  This is the first good solution that I have really played with.  It is important to note that in the enzyme examples, they are using **not** using Jest for their assertions.

## ES6

## React

## [Redux](http://redux.js.org/)

### [Redux Dev Tools](https://github.com/gaearon/redux-devtools)

[![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Todo

- [x] Dev: Setup routing
- [ ] Dev: Setup network layer
- [x] Tools: Production build
- [ ] Tools: Version bump
- [ ] Test: Unit tests for redux actions
- [ ] Test: Unit tests for redux reducers
- [x] Test: UI tests using enzyme
- [ ] Docs: Browser Tools
