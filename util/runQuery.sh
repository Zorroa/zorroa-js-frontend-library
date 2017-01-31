#!/bin/bash

FLICKR_SERVER="54.89.104.244"
SERVER=$FLICKR_SERVER
USERNAME=admin
PASSWORD=z0rr0@12
QUIET=""

usage() {
	cat <<-EOF 1>&2
		Usage: <query.json> [-s <server>] [-u <username>] [-p <password>]
		  default server="$SERVER"
		  default username="$USERNAME"
		  default password="$PASSWORD"
	EOF
	exit 1
}

QUERY_FILE=${1}
shift

if [[ "$QUERY_FILE" == "" || ! -e "$QUERY_FILE" ]]; then
	usage
fi

while :
do
	case "$1" in
		-s | --server   ) SERVER="$2"   ; shift 2;;
		-u | --user     ) USERNAME="$2" ; shift 2;;
		-p | --password ) PASSWORD="$2" ; shift 2;;
		-q | --quiet    ) QUIET="-s"    ; shift 1;;
		--              ) break;; # End of all options
		-*              ) echo "Error: Unknown option: $1" >&2; exit 1;;
		*               ) break;; # No more options
	esac
done

# load the given file
filter=$(cat $QUERY_FILE | tr -d '\n' | tr -s ' ')

command=$(cat << END
curl $QUIET -H "Content-Type: application/json" -X POST http://${SERVER}:8066/api/v3/assets/_search -u $USERNAME:$PASSWORD -d '$filter'
END
)

echo command=$command >&2
echo >&2
echo results: >&2
eval $command
