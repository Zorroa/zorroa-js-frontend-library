#!/bin/bash
#
# open ssh connection to node.
# pass the vpn ip, e.g. 10.8.0.3
#
# Usage: sshNodeHost.sh <vpn ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then >&2 echo "Usage: $0 <ip>"; exit 1; fi
shift

# make sure ssh key perms are correct
chmod 600 id_rsa_zorroa_selenium_node

ssh -q -i id_rsa_zorroa_selenium_node -o ConnectTimeout=5 -o BatchMode=yes -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no zorroa@$HOST "$@"
