#!/bin/bash
#
# Stop a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: stopNodeOnHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then echo "Usage: $0 <ip>"; exit 1; fi
shift

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_node

./sshNodeHost.sh $HOST "cd ~; mkdir -p Desktop/selenium"
cat ./stopNode.sh | ./sshNodeHost.sh $HOST 'cat - > ~/Desktop/selenium/stopNode.sh'
./sshNodeHost.sh $HOST "cd ~/Desktop/selenium; ./stopNode.sh"
