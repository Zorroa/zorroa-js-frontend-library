#!/bin/bash
#
# Open the Selenium Hub console page
#
# Usage: openHub.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

if ! nc -w 0 localhost 4444; then NEED_SSH="true"; else NEED_SSH="false"; fi

if [[ $NEED_SSH == "true" ]]; then
 ssh -i id_rsa_zorroa_selenium_hub -nNT -o StrictHostKeyChecking=no -L 4444:localhost:4444 computeruser@shub.zorroa.com &
 sshPid=$!
fi

# wait for the ssh connection to spin up
while ! nc -w 0 localhost 4444 </dev/null; do sleep 0.25; done

# launch. NB open is mac specific - might be okay since this script is for running manually
open 'http://localhost:4444/grid/console'

if [[ "$NEED_SSH" == "true" ]]; then
 >&2 echo ssh tunnel to the hub is running, if you want to kill it later, do this:
 >&2 echo kill $sshPid
fi
