# JS Curator


| Branch | Status |
|--------|--------|
|DEVELOPMENT | [![Build Status](https://travis-ci.com/Zorroa/zorroa-js-curator.svg?token=DkSE9z1EaP34PLjqWxX2&branch=development)](https://travis-ci.com/Zorroa/zorroa-server) |
| QA | [![Build Status](https://travis-ci.com/Zorroa/zorroa-js-curator.svg?token=DkSE9z1EaP34PLjqWxX2&branch=qa)](https://travis-ci.com/Zorroa/zorroa-server) |
| MASTER | [![Build Status](https://travis-ci.com/Zorroa/zorroa-js-curator.svg?token=DkSE9z1EaP34PLjqWxX2&branch=master)](https://travis-ci.com/Zorroa/zorroa-server) |

## Dependency assumptions

1. To run the app you'll need to have [Docker](https://www.docker.com/).
1. You will be required to use [Node 8](https://nodejs.org/en/) for this app.
    You can also use [Node Version Manager](https://github.com/creationix/nvm)
    which will make your life a lot easier. After installing NVM you can run a
    command such as `nvm use 8`.

## Starting the App
1. Run `npm run deploy` (This only needs to be run the first time, or when
   the code has changed).
1. Run `npm run start:docker`

### Project Dependencies

Run `npm install` from the project root using your terminal. This command will
use the `package.json` file to install all project dependencies.

## Code Style

### Javascript

We don't like arguing about whitespace and comas. Code style is enforced using
ESLint mostly using rules from StandardJS and Prettier.

### CSS/SCSS

There are many different styles of CSS in the code base. That's changing, we'd
like to use a [BEM-inspired](getbem.com/introduction/) standard going forward.
Example class names could look like:

```scss
.ImageThumb__fan-stack {
  // Stuff
}

.ImageThumb__fan-stack--disabled {
  // Stuff
}
```

## Dev mode

Dev mode is for the typical daily workflow and has live reloading enabled. It
does not actually build into a directory, it runs the project though a dev
server that uses the files in your working tree.

The first time you run the dev server you'll need to generate a certificate.

```
npm run dev-https-cert
```

From then on you can start the dev server by running the following.

```
npm run dev-https
```

Once the build is complete you can access the server at
[https://localhost:8081](https://localhost:8081). You'll need to connect to a
live environment by filling out the "Archivist" field on the login page. Input
the domain name of a running environment (i.e. staging.pool.zorroa.com or
localhost:8066) and check the "SSL" box (assuming the archivist is using TLS).

### Fonts

Make sure you install all the fonts in the
[./src/assets/fonts](https://github.com/Zorroa/zorroa-js-curator/tree/master/src/assets/fonts)
directory. It's not strictly needed for running, but trust us, it'll make your
life easier.

## Production mode

Production mode is for testing the build. This fires up an Express-based web
server that serves static assets and routes requests to the correct backend
(this backend defaults to http://localhost:8066, but may be overridden by
changing the `ARCHIVIST_API_URL` enviromental variable.

```
npm run build # create static build in bin/
npm start     # serve the static content in bin/
```

## Testing

You can run the tests by executing the following command in your terminal:
`npm test`. This will run the entire test suite.

Tips for making testing quicker & easier:

- `npm run test:watch`
  - Run the tests and have them watch for changes. This is super useful when
    writing your tests.

### Resources for writing tests:

- Test runner: [Jest](https://github.com/facebook/jest/)
- Continuous Integration:
  [TravisCI](https://travis-ci.com/Zorroa/zorroa-js-curator/)
- React component testing: [Enzyme](http://airbnb.io/enzyme/)

## Deploying the project

This is in flux as the system is migrated to the cloud. One day merging to qa
and master will trigger deploys to a staging server and production respectively.

For now though files are copy and pasted in to RPM builds. To perform a
production build run `npm run build`, and copy the `./bin` directory to the
relevant places.

More information on deploy processes can be found on the wiki at
https://wiki.zorroa.com/display/TECH/SDLC+Explained

### SSL in Production

The docker container can be configured to automatically pull SSL certificate files from 
a GCS bucket. To set this up create a bucket and upload a key.pem and cert.pem file to the bucket.
When running the container set the GCLOUD_SSL_BUCKET env var. This env var should be the name of the 
bucket, optionally it can be the complete path to a folder within a bucket. Examples are "my-ssl-certs-bucket" 
or "my-configs-bucket/ssl-certs".

## Development Tools

Our project will run in most standard JavaScript editors, including Atom and
WebStorm.

You can set breakpoints and debug variables in Chrome, Firefox or other browser
debuggers. The build/webpack.dev.js file contains additional debugging
configuration for the transpiled code, specifically the devtools setting, which
controls the final compiled code style, and the source map configurations, which
allow you to map from the transpiled code back to the original source files.

#### Plugins

- [Redux Dev Tools](https://github.com/gaearon/redux-devtools)
- [React Dev Tools](https://github.com/facebook/react-devtools)

#### Documentation

- [EMCAScript 6 New Features: Overview & Comparison](http://es6-features.org)
- [Redux docs](http://redux.js.org/)
- [react-redux API from GitHub Readme](https://github.com/reactjs/react-redux/blob/master/docs/api.md)
  with connect, mapStateToProp and mapDispatchToProp API
- [Axios HTTP framework](https://github.com/mzabriskie/axios) with examples for
  GET, POST, and other HTTP utilities
