#!/bin/bash
#
# Spin up a selenium node
# It is assumed that:
# - this machine is osx
# - vpn connection to shub is open, and shub is available at 10.8.0.1

SERVER=selenium-server-standalone-3.4.0.jar
CHROMEDRIVER=chromedriver
HUB=http://10.8.0.1:4444

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR

# download selenium jar file if it's not already here
if [[ ! -e $SERVER ]]; then
  curl -O https://selenium-release.storage.googleapis.com/3.4/$SERVER
fi

# download chromedriver if it's not already here
# https://sites.google.com/a/chromium.org/chromedriver/downloads
# https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip
if [[ ! -e $CHROMEDRIVER ]]; then
  curl -O https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip
  unzip chromedriver_mac64.zip
fi

# kill old server, if running
killall java

# delete all but last 2 log files
ls selenium-node-*.log | sort -r | sed '1d;2d' | xargs rm

# launch & disown selenium node
logfile=selenium-node-$(date "+%Y_%m_%d_%Hh_%Mm_%Ss").log
# find out how much mem on this system. This is mac specific
MEM_GB=$(sysctl hw.memsize | awk '{print int($2/1023**3)}')
MAX_INSTS=$(( $MEM_GB / 2 - 1 ))
# OPTS string from http://www.software-testing-tutorials-automation.com/2016/04/usage-of-maxsession-in-grid-2-to-set.html
# OPTS="-browser browserName=firefox,maxInstances=2 -browser browserName=chrome,maxInstances=2"
OPTS="-browser browserName=chrome,maxInstances=$MAX_INSTS -maxSession $MAX_INSTS -debug true"
# all local folder to PATH, so selenium can see chromedriver
PATH=$PATH:. java -jar $SERVER -role node -hub $HUB $OPTS &> $logfile &
disown -r

sleep 1 # wait a sec for log file to exist TODO: actually wait for the file

echo logging to $logfile
echo starting Selenium node...
tail -f $logfile | tee /dev/stderr | grep -qe 'The node is registered to the hub and ready to use'
