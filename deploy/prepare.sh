#!/bin/bash


whereAmI=$(cd `dirname $0`; pwd)
projectPath="${whereAmI%\/*}"
action=$1

host="`hostname`"
if [[ "production-02 production-03 production-04" =~ "$host" ]]; then
  host="${host}.9ztrade.com"
fi

if [[ "$action" == 'prepare' ]]; then
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
  if [[ "`curl -sI http://${host}:7776/item-images/im-ready | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "item-images is ready"
  else
    echo "something wrong with nginx config, probably root location or port conflict"
  fi

  echo "prepare config.js and gunicorn.conf"
  sed -i "s#\ \ \ \ imageHost = 'localhost'#\ \ \ \ imageHost = '${host}'#g" ${projectPath}/app/main/static/config.js
  sed -i "s#\ \ \ \ imageHost = 'localhost:7770'#\ \ \ \ imageHost = '${host}:7770'#g" ${projectPath}/deploy/gunicorn.conf

elif [[ "$action" == 'gstart' ]]; then
  echo "start gunicorn"
  cd $projectPath && /usr/local/bin/gunicorn main_app:main_app -c ./deploy/gunicorn.conf

  echo "check gunicorn"
  if [[ "`curl -sI http://${host}:7770 | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "gunicorn is ready"
  else
    echo "something wrong with gunicorn config, probably application module or port conflict"
  fi

elif [[ "$action" == 'gstop' ]]; then
  echo "stop gunicorn"
  gunicorn_pid="`ps -eo pid,command | grep 'gunicorn.*main_app:main_app' | grep -v grep | sort | head -1 | awk '{print $1}'`"
  kill -9 $gunicorn_pid

  if [[ "`cat ${projectPath}/gunicorn.pid`" == "$gunicorn_pid" ]]; then
    rm -f ${projectPath}/gunicorn.pid
  fi
fi
