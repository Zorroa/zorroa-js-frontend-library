#!/bin/bash
#
# List all
#
# Usage: listGridNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

ssh -i id_rsa_zorroa_selenium_hub -nNT -o StrictHostKeyChecking=no -L 4444:localhost:4444 computeruser@shub.zorroa.com &
sshPid=$!

# wait for the ssh connection to spin up
while ! nc -w 0 localhost 4444 </dev/null; do sleep 0.25; done

# query the selenium grid console to see which nodes are registered
nodes=$(curl -s -m 10 localhost:4444/grid/console | perl -ne 'if (m|http://([^\s]+):5555|) { print "$1\n" }' | sort | uniq)

echo $nodes

kill $sshPid
