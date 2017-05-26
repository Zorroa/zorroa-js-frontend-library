#!/bin/bash
#
# List all VPN IPs
#
# Usage: listVpnNodes.sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# list all IPs on the vpn, except the hub at 10.8.0.1
nodes=$(nmap --min-parallelism 100 -sn 10.8.0.1/24 | egrep -o '\b10\.8\.0\.[[:digit:]]+' | sort | uniq | egrep -v '\b10\.8\.0\.1\b')

# list all nodes that are whitelisted for selenium use -- they have a ~/.zorroa-grid file
parallel -k "if sshNodeHost.sh {1} 'stat ~/.zorroa-grid > /dev/null 2>&1'; then echo {}; fi" ::: $nodes
