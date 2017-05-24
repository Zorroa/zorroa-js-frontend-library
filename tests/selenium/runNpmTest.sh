#!/bin/bash -x
#
# Wrapper script to launch tests
# Needed to setup network connections to Selenium Grid

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projroot=$DIR/../..

cd $DIR

# setup localhost:4444 to see our selenium hub
# expose our web server on a random port (so multiple tests can run on the grid simultaneously)
export ZORROA_GRID_PORT=$(node -e 'console.log(Math.round(Math.random()*1000+8000))')
ssh -L 4444:localhost:4444 -R $ZORROA_GRID_PORT:localhost:8080 -i id_rsa_zorroa_selenium_hub -nNT computeruser@shub.zorroa.com & sshPid=$!

# Run all tests
# -w 4 is 4 workers; this is currently the number of selenium nodes we have
# TODO use -w 8 when we have > 8 nodes (it's the number of selenium tests we have)
$projroot/node_modules/.bin/jest -w 4 --debug --forceExit --logHeapUsage --verbose

kill $sshPid
