const {execSync} = require('child_process')
const {join} = require('path')
const git = require("nodegit");
const DEVELOPMENT_BRANCH = 'jd/storybook' // TODO change this to master

console.log(`Updating to latest ${DEVELOPMENT_BRANCH}`)
execSync(`git checkout ${DEVELOPMENT_BRANCH} && git pull origin ${DEVELOPMENT_BRANCH}`)

console.log('Run tests')
execSync('npm run test')
