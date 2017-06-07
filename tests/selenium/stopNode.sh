#!/bin/bash
#
# Stop a locally running selenium node

# DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# cd $DIR

serverPid=$(ps aux | grep java | grep selenium | awk '{print $2}')

if [[ "$serverPid" != "" ]]; then
  kill $serverPid
  echo killed $serverPid
else
  echo nothing to kill
fi
