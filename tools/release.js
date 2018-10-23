const {execSync} = require('child_process')
const {join} = require('path')
const {readFileSync, writeFileSync} = require('fs')

const git = require("nodegit");
const DEVELOPMENT_BRANCH = 'jd/storybook' // TODO change this to master
const RELEASE_BRANCH = 'jd/release' // TODO change this to master

console.log(`Updating to latest ${DEVELOPMENT_BRANCH}`)
execSync(`git checkout ${DEVELOPMENT_BRANCH} && git pull origin ${DEVELOPMENT_BRANCH}`)

console.log('Run tests')
execSync('npm run test')
console.log('Tests are good')

console.log(`Updating to latest ${RELEASE_BRANCH}`)
execSync(`git checkout ${RELEASE_BRANCH} && git pull origin ${RELEASE_BRANCH}`)

console.log(`Add latest changes from ${DEVELOPMENT_BRANCH} to ${RELEASE_BRANCH}`)
execSync(`git merge ${DEVELOPMENT_BRANCH}`)

const packageJsonFile = readFileSync('./package.json', 'utf8')
const packageJson = JSON.parse(packageJsonFile)
const versions = packageJson.version.split('.').map(number => Number.parseInt(number, 10))
versions[2] = versions[2] + 1
packageJson.version = versions.join('.')
console.log(`Update version to ${packageJson.version}`)
writeFileSync('./package.json', JSON.stringify(packageJson, undefined, 2))

console.log('Building library')
execSync('NODE_ENV="development" npm run build')

console.log('Commit release changes')
execSync(`git commit -m "Release ${packageJson.version}"`)

console.log('Pushing release')
execSync(`git push origin ${RELEASE_BRANCH}`)
execSync(`git tag ${packageJson.version} && git push origin ${packageJson.version}`)

console.log('Update online Storybook documenation')
execSync('npx storybook-to-ghpages')
