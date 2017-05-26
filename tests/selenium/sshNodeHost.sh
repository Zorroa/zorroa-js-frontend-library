#!/bin/bash
#
# open ssh connection to node. give it a vpn ip, e.g. 10.8.0.3
#
# Usage: sshNodeHost.sh <ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then
  echo "Usage: $0 <ip>"
  exit
fi

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_{hub,node}

ssh -i id_rsa_zorroa_selenium_node -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no zorroa@$HOST
