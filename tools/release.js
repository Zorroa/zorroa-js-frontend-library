const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')

const program = require('commander')
const DEVELOPMENT_BRANCH = 'master'
const RELEASE_BRANCH = 'release'
const RELEASE_TYPES = ['major', 'minor', 'patch']

program
  .version('0.0.0')
  .option(
    '-r, --release-type <release-type>',
    'Choose a semantic versioning type: major, minor or patch',
  )
  .option('-d, --dry', 'Executes a dry run, i.e. it will not push anything')
  .parse(process.argv)

if (!RELEASE_TYPES.includes(program.releaseType)) {
  console.log(program.releaseType)
  console.log(
    'A release type must be selected. Adhere to SEMVER conventions listed in the README.md. If you missed that section of the README.md, read it *all* again to avoid problems.',
  )
  process.exit(1)
}

console.log(`Updating to latest ${DEVELOPMENT_BRANCH}`)
execSync(
  `git checkout ${DEVELOPMENT_BRANCH} && git pull origin ${DEVELOPMENT_BRANCH}`,
)

console.log('Run tests')
execSync('npm run test')
console.log('Tests are good')

console.log(`Updating to latest ${RELEASE_BRANCH}`)
execSync(`git checkout ${RELEASE_BRANCH} && git pull origin ${RELEASE_BRANCH}`)

console.log(
  `Add latest changes from ${DEVELOPMENT_BRANCH} to ${RELEASE_BRANCH}`,
)
execSync(`git merge ${DEVELOPMENT_BRANCH}`)

const packageJsonFile = readFileSync('./package.json', 'utf8')
const packageJson = JSON.parse(packageJsonFile)
const versions = packageJson.version
  .split('.')
  .map(number => Number.parseInt(number, 10))
const releaseLevel = RELEASE_TYPES.indexOf(program.releaseType)
versions[releaseLevel] = versions[releaseLevel] + 1

// If going from release 1.2.3 to the next major version, the new release is 2.0.0
if (releaseLevel === 0) {
  versions[1] = 0
  versions[2] = 0
}

// If going from release 1.2.3 to the next minor version, the new release is 1.3.0
if (releaseLevel === 1) {
  versions[2] = 0
}

packageJson.version = versions.join('.')
console.log(`Update version to ${packageJson.version}`)
writeFileSync('./package.json', JSON.stringify(packageJson, undefined, 2))

console.log('Building library')
execSync('NODE_ENV="development" npm run build')

console.log('Commit release changes')
execSync(
  `git add dist package.json && git commit -m "Release ${packageJson.version}"`,
)

if (program.dry !== true) {
  console.log('Pushing release')
  execSync(`git push origin ${RELEASE_BRANCH}`)
  execSync(
    `git tag ${packageJson.version} && git push origin ${packageJson.version}`,
  )

  console.log('Update online Storybook documenation')
  execSync('npx storybook-to-ghpages')
}
