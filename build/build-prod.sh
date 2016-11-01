#!/bin/bash

# Example bump uses
# patch: sh build-prod.sh patch
# minor: sh build-prod.sh minor
# major: sh build-prod.sh major

versionType="$1"

bumpVersion() {
  VERSION=$(npm version $versionType -m "$USER bumped the version to %s for deployment to production on $(date +%Y-%m-%d@%H:%M)")
  echo "Version bumped to" $VERSION
  git tag $VERSION -am "Production Distribution Build from $USER on $date"
  git push origin $VERSION
}

build() {
  git pull origin master &&
  rm -rf node_modules &&
  npm cache clean &&
  npm install &&
  npm run build
}

deployCheck() {
  # Potential Types: [prepatch, preminor, premajor, prerelease]
  # Available Types: [patch, minor, major] patch is the default so it is not passed
  ALLOWED_VERSIONS="patch minor major"
  if [[ ! " $ALLOWED_VERSIONS " =~ " $versionType " ]]; then
    echo "Unknown version type \"$versionType\""
    echo "Known version types: $ALLOWED_VERSIONS"
    exit 0
  fi

  CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  GITSTATUS=$(git status -s)
  GITHASHLOCAL=$(git rev-parse HEAD)
  GITHASHREMOTE=$(git rev-parse origin/$CUR_BRANCH)

  if [ ! -z "$GITSTATUS" ] || [ "$GITHASHLOCAL" != "$GITHASHREMOTE" ]; then
    echo "You have uncommitted changes; bailing out."
    exit 0
  fi

  if [ "$CUR_BRANCH" != "master" ]; then
    echo "Deploying from branch $CUR_BRANCH"
    read -p "Type $CUR_BRANCH to continue deploying from a custom branch, or Ctrl-C to cancel: " p
    if [ "$p" != "$CUR_BRANCH" ]; then
      echo "Name doesn't match; bailing out."
      exit 0
    fi
  fi
}

deploy() {
  # deploy.sh should be sitting next to this script, so figure out where we are
  # http://stackoverflow.com/a/246128/1424242
  DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

  $DIR/deploy.sh
}

deployCheck && build && bumpVersion && deploy
