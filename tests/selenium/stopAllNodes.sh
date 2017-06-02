#!/bin/bash
#
# Stop a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: stopNodeOnHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

myAddr=$(ifconfig | egrep -o '\b10\.8\.0\.[[:digit:]]+\b' | sort | uniq)
echo I am on $myAddr
if [[ "$myAddr" == "" ]]; then
  >&2 echo 'not connected to vpn?'
  exit 1
fi

echo looking for nodes...
nodes=$(./listGridNodes.sh)
if [ "$nodes" == "" ]; then
  echo 'no nodes are running'
  exit
fi

echo stopping nodes: $nodes

parallel "echo stopping node {1}; ./stopNodeOnHost.sh {1}" ::: $nodes
