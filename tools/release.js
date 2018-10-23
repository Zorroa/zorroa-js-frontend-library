const {execSync} = require('child_process')
const {join} = require('path')
const git = require("nodegit");

console.log('Updating to latest master')
execSync('git checkout master && git pull origin master')

console.log('Run tests')
execSync('npm run test')
