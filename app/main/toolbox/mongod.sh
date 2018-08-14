#!/bin/bash
#
# how to use this script
# copy this shell script and mongod.yaml.ancestor to where mongodb installed
# then run ./mongod.sh up | down to start or stop mongod process
#
# https://stackoverflow.com/questions/11774887/how-to-stop-mongo-db-in-one-command
# https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/

source ${HOME}/env-setup/env-helper/SimpleLogsHelper.sh

# delete mongod.yaml if either install_path or mongo_pack is changed
# mongo_root/data/logs in mongod.yaml.ancestor will be replaced
# and then a copy of it will be made into mongod.yaml when mongod.sh runs
mongo_root=$(cd `dirname $0`; pwd)
mongo_data="${mongo_root}/data"
mongo_logs="${mongo_root}/logs"
config_file_ancestor="${mongo_root}/mongod.yaml.ancestor"
config_file="${mongo_root}/mongod.yaml"

actions='up down'
action=$1

if [[ ! "$actions" =~ "$action" ]]; then
  RedLight "invalid action, choose among [$actions]"
  exit 11
fi

pushd $mongo_root >& /dev/null

if [[ ! -f ${config_file_ancestor} ]]; then
  RedLight "$config_file_ancestor does not exist"
  exit 11
fi


if [[ ! -f ${config_file} ]]; then
  View "making $config_file"
  sed -e "s#\${mongo_root}#${mongo_root}#" \
      -e "s#\${mongo_data}#${mongo_data}#" \
      -e "s#\${mongo_logs}#${mongo_logs}#" \
      ${config_file_ancestor} > ${config_file}
fi

for folder in data logs; do
  target_folder="${mongo_root}/${folder}"
  if [[ ! -d ${target_folder} ]]; then
    View "making folder ${target_folder}"
    mkdir -p ${target_folder}
  fi
done

if [[ "$action" == 'up' ]]; then
  View "starting mongod in background, see logs under ${mongo_logs}"
  ./bin/mongod --config $config_file
elif [[ "$action" == 'down' ]]; then
  mongo_pid="`ps -fe | grep mongo | grep -v grep | awk '{print $2}'`"
  View "stopping mongod with pid [$mongo_pid]"
  kill $mongo_pid
fi

popd >& /dev/null
