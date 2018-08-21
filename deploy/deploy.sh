#!/bin/bash
#
# why 'head | awk' fails in script but works in command line
# https://stackoverflow.com/questions/3452339/how-do-i-use-output-from-awk-in-another-command
# https://superuser.com/questions/742238/piping-tail-f-into-awk


whereAmI=$(cd `dirname $0`; pwd)
projectPath="${whereAmI%\/*}"
action=$1

host="`hostname`"
if [[ "production-02 production-03 production-04" =~ "$host" ]]; then
  host="${host}.9ztrade.com"
fi

if [[ "$action" == 'nginx' ]]; then
  if [[ `id -u` -ne 0 ]]; then
    echo "needs root or sudo to prepare nginx"
    exit 11
  fi

  echo "prepare item-images nginx config"
  sed -e "s#localhost#${host}#g" \
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
  if [[ "`unbuffer curl -sI http://${host}:7776/item-images/im-ready | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "item-images is ready"
  else
    echo "something wrong with nginx config, probably root location or port conflict"
  fi

elif [[ "$action" == 'config' ]]; then
  echo "prepare entrance.js and gunicorn.conf"
  sed -i "s#\ \ \ \ imageHost = 'localhost'#\ \ \ \ imageHost = '${host}'#g" ${projectPath}/app/main/static/entrance.js
  sed -i "s#bind = 'localhost:7770'#bind = '${host}:7770'#g" ${projectPath}/deploy/gunicorn.conf

elif [[ "$action" == 'gc' ]]; then
  echo "git checkout -- entrance.js and gunicorn.conf"
  sed -i "s#\ \ \ \ imageHost = '${host}'#\ \ \ \ imageHost = 'localhost'#g" ${projectPath}/app/main/static/entrance.js
  sed -i "s#bind = '${host}:7770'#bind = 'localhost:7770'#g" ${projectPath}/deploy/gunicorn.conf

elif [[ "$action" == 'gstart' ]]; then
  echo "start gunicorn"
  cd $projectPath && /usr/local/bin/gunicorn main_app:main_app -c ./deploy/gunicorn.conf

  echo "check gunicorn"
  if [[ "`unbuffer curl -sI http://${host}:7770/login | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "gunicorn is ready"
  else
    echo "something wrong with gunicorn config, probably application module or port conflict"
  fi

elif [[ "$action" == 'gstop' ]]; then
  gunicorn_pid="`ps -eo pid,command | grep 'gunicorn.*main_app:main_app' | grep -v grep | sort | head -1 | awk '{print $1}'`"
  echo "stop gunicorn by [kill -9 $gunicorn_pid]"
  kill -9 $gunicorn_pid

  if [[ -f ${projectPath}/gunicorn.pid && "`cat ${projectPath}/gunicorn.pid`" == "$gunicorn_pid" ]]; then
    echo "remove gunicorn.pid"
    rm -f ${projectPath}/gunicorn.pid
  fi
else
  echo "unknown action [$action], plz choose among [nginx | config | gc | gstart | gstop]"
fi
