#!/bin/bash
#
# why 'head | awk' fails in script but works in command line
# https://stackoverflow.com/questions/3452339/how-do-i-use-output-from-awk-in-another-command
# https://superuser.com/questions/742238/piping-tail-f-into-awk


whereAmI=$(cd `dirname $0`; pwd)
projectPath="${whereAmI%\/*}"
action=$1

short_host=`hostname`
if [[ "production-02 production-03 production-04" =~ "$short_host" ]]; then
  full_host="${short_host}.9ztrade.com"
fi
devops_path=${HOME}/git-projects/devops
keyfile_path=${devops_path}/config/nginx/cert/${short_host}.key
pemfile_path=${devops_path}/config/nginx/cert/${short_host}.pem

if [[ "$action" == 'nginx' ]]; then
  if [[ `id -u` -ne 0 ]]; then
    echo "needs root or sudo to prepare nginx"
    exit 11
  fi

  echo "prepare item-images nginx config"
  sed -e "s#localhost#${full_host}#g" \
    -e "s#somewhere#${projectPath}#g" \
    nginx-item-images > item-images

  cp item-images /etc/nginx/sites-available && mkdir -p /etc/nginx/logs
  cd /etc/nginx/sites-enabled && ln -s ../sites-available/item-images item-images

  echo "start | restart nginx"
  # grep pid /etc/nginx/nginx.conf
  if [[ -f /run/nginx.pid ]]; then
    nginx -s reload
  else
    nginx
  fi

  echo "check item-images"
  touch ${projectPath}/item-images/im-ready
  if [[ "`unbuffer curl -sI http://localhost:7776/item-images/im-ready | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "item-images is ready"
  else
    echo "something wrong with nginx config, probably root location or port conflict"
  fi

elif [[ "$action" == 'config' ]]; then
  echo "prepare entrance.js and gunicorn.conf"
  cd $projectPath
  sed -i "s#\ \ \ \ imageHost = 'localhost'#\ \ \ \ imageHost = '${full_host}'#g" app/main/static/entrance.js
  sed "s#bind = 'localhost:7770'#bind = '${full_host}:7770'#g" deploy/gunicorn.conf.ancestor > deploy/gunicorn.conf
  echo "keyfile = '${keyfile_path}'" >> deploy/gunicorn.conf
  echo "certfile = '${pemfile_path}'" >> deploy/gunicorn.conf

elif [[ "$action" == 'gc' ]]; then
  echo "clean entrance.js and gunicorn.conf"
  sed -i "s#\ \ \ \ imageHost = '${full_host}'#\ \ \ \ imageHost = 'localhost'#g" ${projectPath}/app/main/static/entrance.js
  rm -f ${projectPath}/deploy/gunicorn.conf

elif [[ "$action" == 'gstart' ]]; then
  # https://stackoverflow.com/questions/15443106/how-to-check-if-mongodb-is-up-and-ready-to-accept-connections-from-bash-script
  echo "check mongodb"
  declare -i count=0
  until nc -z localhost 27017; do
    sleep 3
    count=$((count+1))
    if [[ "$count" -eq 20 ]]; then
      echo "mongodb is not accessible after 1min wait, GSTART abort."
      exit 11
    fi
  done

  echo "check nginx:7776"
  declare -i count=0
  until nc -z localhost 7776; do
    sleep 3
    count=$((count+1))
    if [[ "$count" -eq 20 ]]; then
      echo "nginx:7776 is not accessible after 1min wait, GSTART abort."
      exit 11
    fi
  done

  echo "start gunicorn"
  cd $projectPath && /usr/local/bin/gunicorn main_app:main_app -c ./deploy/gunicorn.conf

  echo "check gunicorn"
  if [[ "`unbuffer curl -sI https://${full_host}:7770/login | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "gunicorn is ready"
  else
    echo "something wrong with gunicorn config, probably application module or port conflict"
  fi

elif [[ "$action" == 'gstop' ]]; then
  gunicorn_pid="`ps -eo pid,command | grep 'gunicorn.*main_app:main_app' | grep -v grep | sort | head -1 | awk '{print $1}'`"
  if [[ -f ${projectPath}/gunicorn.pid && "`cat ${projectPath}/gunicorn.pid`" == "$gunicorn_pid" ]]; then
    echo "stop gunicorn by [kill -SIGINT $gunicorn_pid]"
    kill -SIGINT $gunicorn_pid && rm -f ${projectPath}/gunicorn.pid
  fi
else
  echo "unknown action [$action], plz choose among [nginx | config | gc | gstart | gstop]"
fi
