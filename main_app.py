#!/usr/bin/env python3

from flask import render_template
from app.main import create_app
from app import api

# from app import blueprint
# main_app.register_blueprint(blueprint)

main_app = create_app('dev')

@main_app.route('/', methods=['GET'])
@main_app.route('/index', methods=['GET'])
def index():
  return render_template('index.html')


api.init_app(main_app)
main_app.app_context().push()

list_routers = 0


if __name__ == '__main__':
  if list_routers:
    for i, router in enumerate(main_app.url_map.iter_rules()):
      print(i, router)

  main_app.run()

  pass