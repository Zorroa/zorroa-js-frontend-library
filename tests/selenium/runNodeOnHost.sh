#!/bin/bash
#
# Spin up a selenium node on a remote machine
# Assumes local machine is on the selenium vpn
#
# Usage: runNodeOnHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then
  echo "Usage: $0 <ip>"
  exit
fi

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_{hub,node}

ssh -i id_rsa_zorroa_selenium_node -o StrictHostKeyChecking=no zorroa@$HOST "cd ~; mkdir -p Desktop/selenium"
scp -i id_rsa_zorroa_selenium_node -o StrictHostKeyChecking=no runNode.sh stopNode.sh zorroa@$HOST:~/Desktop/selenium/
ssh -i id_rsa_zorroa_selenium_node -o StrictHostKeyChecking=no zorroa@$HOST "cd ~/Desktop/selenium; ./runNode.sh"
