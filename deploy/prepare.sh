#!/bin/bash


whereAmI=$(cd `dirname $0`; pwd)
projectPath="${whereAmI%\/*}"
action=$1

if [[ "$action" == 'nginx' ]]; then
  if [[ `id -u` -ne 0 ]]; then
    echo "needs root or sudo to prepare nginx"
    exit 11
  fi

  echo "prepare nginx"
  host="`hostname`"
  if [[ "production-02 production-03 production-04" =~ "$host" ]]; then
    host="${host}.9ztrade.com"
  fi

  echo "prepare item-images"
  sed -e "s#localhost#${host}#g" \
    -e "s#somewhere#${projectPath}#g" \
    nginx-item-images > item-images

  cp item-images /etc/nginx/sites-available
  cd /etc/nginx/sites-enabled
  ln -s ../sites-available/item-images item-images
  mkdir -p /etc/nginx/logs

  echo "start | restart nginx"
  # grep pid /etc/nginx/nginx.conf
  if [[ -f /run/nginx.pid ]]; then
    nginx -s reload
  else
    nginx
  fi

  echo "check item-images"
  if [[ "`curl -sI http://${host}:7776/item-images/running | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "item-images is ready"
  else
    echo "something wrong with nginx config, probably root location or port conflict"
  fi
elif [[ "$action" == 'gunicorn' ]]; then
  echo "prepare config.js"
  cd ${projectPath}/app/main/static
  sed -i "s#imageHost = \'localhost\'#imageHost = \'${host}\'#g" config.js

  echo "start gunicorn"
  cd $projectPath
  /usr/local/bin/gunicorn main_app:main_app -c gunicorn.conf

  echo "check gunicorn"
  if [[ "`curl -sI http://${host}:7770 | head -1 | awk '{print $2}'`" -eq 200 ]]; then
    echo "gunicorn is ready"
  else
    echo "something wrong with gunicorn config, probably application module or port conflict"
  fi
fi
