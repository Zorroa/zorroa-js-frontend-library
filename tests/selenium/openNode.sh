#!/bin/bash
#
# Open a specific node's console page
# With the node console, you can see running sessions & take screenshots
#
# Usage: openNode.sh <vpn ip>

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

HOST=$1
if [[ "$HOST" == "" ]]; then >&2 echo "Usage: $0 <ip>"; exit 1; fi
shift

# launch. NB open is mac specific - might be okay since this script is for running manually
open "http://$HOST:5555/wd/hub/static/resource/hub.html"
