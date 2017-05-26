#!/bin/bash
#
# Stop a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: stopNodeOnHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

myAddr=$(ifconfig | egrep -o '10.8.0.[[:digit:]]+' | sort | uniq)
echo I am on $myAddr
if [[ "$myAddr" == "" ]]; then
  echo 'not connected to vpn?'
  exit
fi

nodes=$($DIR/listVpnNodes.sh)
parallel -k "echo stopping node {1}; ./stopNodeOnHost.sh {1}" ::: $nodes
