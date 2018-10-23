# Frontend Library

 The frontend library provides a collection of React-based components that use
 the Zorroa Design Systems Manual designs. The public API is the React components.
 Breaking changes in the React components' public API (i.e. props) will be reflected
 in the SEMVER versioning for this project. Breaking changes to markup, variables and
 SCSS can occur in minor and patch releases, thus it's strongly encouraged to only
 use the public API if possible.

 Available components and documentation can be viewed at https://zorroa.github.io/zorroa-js-frontend-library

 ## Development

 This project depends on the Node/NPM ecosystem. You must have Node and NPM
 installed locally to run this.

 0) Run `npm install` to install the dependencies
 0) Run `npm run storybook` to get a live-reloading dev server

 ## Releases

 Releases are currently a manual process, the goal is to automate this more in to
 a single command such as `npm run release --version='1.2.3'`, but until now
 follow these instructions to cut a release.

 0) Pull the latest change and checkout master: `git fetch origin master && git checkout master`
 0) Run the tests: `npm run test`
 0) Update the version property in package.json, adhering to SEMVER conventions
 0) Pull the latest release branch and checkout: `git fetch origin release && git checkout release`
 0) Merge master: `npm run master`
 0) Build the library code: `npm run build`
 0) Commit the built code, including a message that indicates the release number: `git commit -m "Release 1.2.3"`
 0) Push the release branch: `git push origin release`
 0) Tag the release and push the tag: `git tag 1.2.3 && git push origin 1.2.3`
 0) Deploy the latest Storybook documentation to Github pages: `npx storybook-to-ghpages`
