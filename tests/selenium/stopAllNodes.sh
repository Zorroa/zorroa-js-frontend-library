#!/bin/bash
#
# Stop a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: stopNodeOnHost.sh <ip>

# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# cd $DIR

# one way to list all nodes is query the selenium grid console (best for stopping)
nodes=$(curl -s localhost:4444/grid/console | perl -ne 'if (m|http://([^\s]+):5555|) { print "$1\n" }' | sort | uniq)
# another way is check all the IPs on the selenium vpn. (best for starting)
# remove the hub address
# nodes=$(nmap -sn 10.8.0.1/24 | perl -ne 'if (m|10.8.0.[\d+]|) { print "$1\n" }' | sort | uniq | grep -v 10.8.0.1

for node in $nodes; do
  echo stopping node $node
  ./stopNodeOnHost.sh $node
done
