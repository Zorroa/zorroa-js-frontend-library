#!/bin/bash -x
#
# Wrapper script to launch tests
# Needed to setup network connections to Selenium Grid

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projroot=$DIR/../..
cd $DIR

# To default to Sauce Labs or local tests, set this false:
# For Sauce Labs tests, don't forget to adjust .travis.yml too
USE_ZORROA_GRID="true"

if [[ $USE_ZORROA_GRID == "true" ]]; then
  # make sure ssh key perms are correct
  chmod 600 id_rsa_zorroa_selenium_hub

  # setup localhost:4444 to see our selenium hub via ssh tunnel
  # expose our web server on a random port (so multiple tests can run on the grid simultaneously)
  export ZORROA_GRID_PORT=$(node -e 'console.log(Math.round(Math.random()*1000+8000))')
  ssh -4 -q -i id_rsa_zorroa_selenium_hub -nNT -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o StrictHostKeyChecking=no -L 4444:localhost:4444 -R $ZORROA_GRID_PORT:localhost:8080 computeruser@shub.zorroa.com > /dev/null 2>&1 &
  sshPid=$!

  # wait for the ssh connection to spin up
  while ! nc -w 1 localhost 4444 </dev/null; do sleep 1; done

  curl localhost:4444 > /dev/null # wait for ssh to finish fully connecting

  # make sure a server is running
  if ! nc -z shub.zorroa.com $ZORROA_GRID_PORT; then
    echo "I see no curator running on shub:$ZORROA_GRID_PORT; make sure to start your server"
    kill $sshPid
    exit 1
  fi
fi

# Run all tests
# jest -w 8 would start 8 workers (# tests running simultaneously) TODO: above 4 seems unstable. why?
# -b flag bails on the suite after the first failure
$projroot/node_modules/.bin/jest -w 4 -b --debug --forceExit --logHeapUsage --verbose "$@"
testResultExitCode=$?

if [[ $USE_ZORROA_GRID == "true" ]]; then
  # close our port forwards
  kill $sshPid
fi

exit $testResultExitCode
