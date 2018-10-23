# Frontend Library

 The frontend library provides a collection of React-based components that use
 the Zorroa Design Systems Manual designs. The public API for this project
 are the React components. Breaking changes in the React component's public API
 (i.e. props) will be reflected in the SEMVER versioning for this project.
 Breaking changes to markup, variables and SCSS can occur in minor and patch
 releases, thus it's strongly encouraged to only use the public API if possible.

 Available components and documentation can be viewed at https://zorroa.github.io/zorroa-js-frontend-library

 ## Development

 This project depends on the Node/NPM ecosystem. You must have Node and NPM
 installed locally to run this.

 1) Run `npm install` to install the dependencies
 1) Run `npm start` to get a live-reloading dev server

 ## Releases

Releases are handled by running the release tool. It will checkout the latest
changes from master, add them to the release branch, update version numbers,
push the changes to a release branch, create tags, and push out the latest
version of Storybook to Github pages.

To perform a dry run (i.e. no code is pushed, but commits are made locally), run
the release tool with the --dry option. For a full list of options run
`npm run deploy -- -h`

### Major Release

If there are breaking changes, perform a major release. A breaking change is a
release that would break any consumer of the components in ./src/lib/*.

Run `npm run deploy -- -r major`

### Minor Release

If there are *no* breaking changes, and you've written a new feature, perform
a minor release.

Run `npm run deploy -- -r minor`

### Patch Release

If there are *no* breaking changes, and you've only fixed a bug, perform
a patch release.

Run `npm run deploy -- -r patch`
