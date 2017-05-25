#!/bin/bash
#
# List all
#
# Usage: openHub.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

NEED_SSH="false"
if ! nc -w 0 localhost 4444; then
 NEED_SSH="true"
fi

if [[ $NEED_SSH == "true" ]]; then
 ssh -i id_rsa_zorroa_selenium_hub -nNT -o StrictHostKeyChecking=no -L 4444:localhost:4444 computeruser@shub.zorroa.com &
 sshPid=$!
fi

# wait for the ssh connection to spin up
while ! nc -w 0 localhost 4444 </dev/null; do sleep 0.25; done

# launch
open 'http://localhost:4444/grid/console'

if [[ "$NEED_SSH" == "true" ]]; then
 echo ssh tunnel to the hub is running, if you want to kill it later, do this:
 echo kill $sshPid
fi
