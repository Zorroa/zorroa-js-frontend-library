#!/bin/bash
#
# Spin up a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: startNodeOnHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then >&2 echo "Usage: $0 <ip>"; exit 1; fi

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_node

./sshNodeHost.sh $HOST "cd ~; mkdir -p Desktop/selenium"
tar cfz - startNode.sh stopNode.sh com.user.selenium.plist | ./sshNodeHost.sh $HOST 'cd ~/Desktop/selenium; tar xfz -'
./sshNodeHost.sh $HOST "cd ~/Desktop/selenium; ./startNode.sh"
