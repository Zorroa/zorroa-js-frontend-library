#!/bin/bash
#
# start selenium node on all our remote machines (all machines on vpn)
#
# Usage: startAllNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

myAddr=$(ifconfig | egrep -o '10.8.0.[[:digit:]]+' | sort | uniq)
echo I am on $myAddr
if [[ "$myAddr" == "" ]]; then
  echo 'not connected to vpn?'
  exit
fi

echo looking for nodes...
nodes=$($DIR/listVpnNodes.sh)
echo nodes: $nodes

parallel -k "echo starting node {1}; ./startNodeOnHost.sh {1}" ::: $nodes
