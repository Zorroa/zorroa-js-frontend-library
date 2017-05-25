#!/bin/bash
#
# start selenium node on all our remote machines (all machines on vpn)
#
# Usage: startAllNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# one way to list all nodes is query the selenium grid console (best for stopping)
# nodes=$(curl -s localhost:4444/grid/console | perl -ne 'if (m|http://([^\s]+):5555|) { print "$1\n" }' | sort | uniq)
# another way is check all the IPs on the selenium vpn. (best for starting)
# remove the hub address & remove the local machine
myAddr=$(ifconfig | egrep -o '10.8.0.[[:digit:]]+' | sort | uniq)
echo I am on $myAddr
if [[ "$myAddr" == "" ]]; then
  echo 'not connected to vpn?'
  exit
fi
echo looking for nodes...
nodes=$(nmap --min-parallelism 256 -sn 10.8.0.1/24 | egrep -o '\b10\.8\.0\.[[:digit:]]+' | sort | uniq | egrep -v '\b10\.8\.0\.1\b' | grep -v "\b$myAddr\b")
echo nodes: $nodes

for node in $nodes; do
  echo starting node $node
  ./startNodeOnHost.sh $node
done
