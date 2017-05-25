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

# launch & disown selenium node
killall java
logfile=selenium-node-$(date "+%Y_%m_%d_%Hh_%Mm_%Ss").log
PATH=$PATH:. java -jar $SERVER -role node -hub $HUB &> $logfile &
disown -r

sleep 1 # wait a sec for log file to exist TODO: actually wait for the file

echo logging to $logfile
echo starting Selenium node...
tail -f $logfile | grep -qe 'The node is registered to the hub and ready to use'
echo 'The node is registered to the hub and ready to use'
