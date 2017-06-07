#!/bin/bash
#
# List all nodes registered with the hub
#
# Usage: listGridNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

if ! nc -w 0 localhost 4444; then NEED_SSH="true"; else NEED_SSH="false"; fi

if [[ $NEED_SSH == "true" ]]; then
 ssh -4 -q -i id_rsa_zorroa_selenium_hub -nNT -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o StrictHostKeyChecking=no -L 4444:localhost:4444 computeruser@shub.zorroa.com > /dev/null 2>&1 &
 sshPid=$!
fi

# wait for the ssh connection to spin up
>&2 echo "waiting for ssh connection"
while ! nc -w 0 localhost 4444 </dev/null; do sleep 0.25; done

# query the selenium grid console to see which nodes are registered
nodes=$(curl -s -m 10 localhost:4444/grid/console | perl -ne 'if (m|http://([^\s]+):5555|) { print "$1\n" }' | sort | uniq)

echo $nodes

if [[ $NEED_SSH == "true" ]]; then
 >&2 echo ssh tunnel to the hub is running, if you want to kill it later, do this:
 >&2 echo kill $sshPid
fi
