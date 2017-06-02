#!/bin/bash
#
# start selenium node on all our remote machines (all machines on vpn)
#
# Usage: startAllNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

myAddr=$(ifconfig | egrep -o '\b10\.8\.0\.[[:digit:]]+\b' | sort | uniq)
echo I am on $myAddr
if [[ "$myAddr" == "" ]]; then
  >&2 echo 'not connected to vpn?'
  exit 1
fi

echo looking for nodes...
nodes=$(./listVpnNodes.sh)
echo starting nodes: $nodes

parallel -k "echo starting node {1}; ./startNodeOnHost.sh {1}" ::: $nodes
