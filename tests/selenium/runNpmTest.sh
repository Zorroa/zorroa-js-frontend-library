#!/bin/bash -x
#
# Wrapper script to launch tests
# Needed to setup network connections to Selenium Grid

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projroot=$DIR/../..

cd $DIR

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_{hub,node}

# setup localhost:4444 to see our selenium hub via ssh tunnel
# expose our web server on a random port (so multiple tests can run on the grid simultaneously)
export ZORROA_GRID_PORT=$(node -e 'console.log(Math.round(Math.random()*1000+8000))')
ssh -i id_rsa_zorroa_selenium_hub -nNT -o StrictHostKeyChecking=no -L 4444:localhost:4444 -R $ZORROA_GRID_PORT:localhost:8080 computeruser@shub.zorroa.com &
sshPid=$!

# wait for the ssh connection to spin up
while ! nc -w 1 localhost 4444 </dev/null; do sleep 1; done

curl localhost:4444/grid/console | head -5

curl localhost:8080/signin | head -5

# Run all tests
# jest -w 8 would start 8 workers (# tests running simultaneously)
$projroot/node_modules/.bin/jest -w 6 --debug --forceExit --logHeapUsage --verbose
testResultExitCode=$?

# close our port forwards
kill $sshPid

exit $testResultExitCode
