#!/bin/sh

# Example bump uses
# Patch: sh build-prod.sh
# Minor: sh build-prod.sh minor
# Major: sh build-prod.sh major

date=`date +%Y-%m-%d@%H:%M`

bumpVersion() {
  bumpType="patch"
  # Potential Types: [prepatch, preminor, premajor, prerelease]
  # Available Types: [patch, minor, major] patch is the default so it is not passed
  if test "$1" = "minor" || test "$1" = "major"; then
    bumpType=$1
  fi
  VERSION=$(npm version $bumpType -m "$USER bumped the version to %s for deployment to production on $date")
  echo "Version bumped to" $VERSION
  git push origin --tag
}

build() {
  git pull origin master &&
  rm -rf node_modules &&
  npm install &&
  npm run build
}

deploy() {
  git commit -am "Production Distribution Build from $USER on $date" &&
  bumpVersion $1
  # git push origin master
  # add your own deployments
}

build && deploy
