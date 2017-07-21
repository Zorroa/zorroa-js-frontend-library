#!/bin/bash

# sharedLinkTest: Test shared_link endpoints
# Usage: sharedLinkTest

DEV_SERVER="https://dev.zorroa.com"
SERVER=$DEV_SERVER
USERNAME="admin"
PASSWORD="z0rr0@12"
QUIET=

usage() {
	cat <<-EOF # 1>&2
		Usage: $0 [-s <server>] [-u <username>] [-p <password>]
		  default server="$SERVER"
		  default username="$USERNAME"
		  default password="$PASSWORD"
	EOF
	exit 1
}

filter=$(cat <<'EOF'
{
  "state":{
   "filter": {
     "range": {
       "flickr.title": {
         "gt": "high",
         "lt": "low"
       }
     }
   },
   "postFilter": {},
   "order": [],
   "size": 5
  }
}
EOF)

filter=$(echo $filter | sed 's/ //g;')

if [[ "$filter" == "" ]]; then
	usage
fi

echo filter:$filter

while :
do
	case "$1" in
		-s | --server   ) SERVER="$2"   ; shift 2;;
		-u | --user     ) USERNAME="$2" ; shift 2;;
		-p | --password ) PASSWORD="$2" ; shift 2;;
		-q | --quiet    ) QUIET="-s"    ; shift 1;;
		-h | --help     ) usage         ; shift 1;;
		--              ) break;; # End of all options
		-*              ) echo "Error: Unknown option: $1" >&2; exit 1;;
		*               ) break;; # No more options
	esac
done

command=$(cat << END
curl $QUIET -H "Content-Type: application/json" -X POST ${SERVER}:8066/api/v1/shared_link -u $USERNAME:$PASSWORD -d '$filter'
END
)

echo command=$command # >&2
echo
results=$(eval $command)
echo results:$results
id=$(echo $results | json id)
echo id:$id

filter1=$(echo $results | json state)
filter1=$(echo $filter1 | sed 's/ //g;')

command2=$(cat << END
curl $QUIET -H "Content-Type: application/json" -X GET ${SERVER}:8066/api/v1/shared_link/$id -u $USERNAME:$PASSWORD
END
)

echo command2=$command2 # >&2
echo
results2=$(eval $command2)
echo results2:$results2

filter2=$(echo $results2 | json state)
filter2=$(echo $filter2 | sed 's/ //g;')

echo filter2:$filter2
echo

if [[ "$filter1" == "$filter2" ]]; then
 echo test PASSED
else
 echo test FAILED
fi
