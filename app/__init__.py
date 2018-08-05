#!/usr/bin/env python3

from flask_restplus import Api
from .main.controller.auth_controller import auth_ns
from .main.controller.user_controller import user_ns
from .main.controller.order_controller import order_ns
from .main.controller.toolbox_controller import toolbox_ns

## seems Namespace does the exactly same work as Blueprint does
## so define url path in respective controller
# from flask import Blueprint
# blueprint = Blueprint('api', __name__, url_prefix='/api')
# api = Api(app=blueprint)

# swagger UI path will be set to 'flask_root/api/'
api = Api(description='Application Programming Interface', doc='/api/')

# https://github.com/noirbizarre/flask-restplus/issues/460
# remove 'default' namespace
api.namespaces.clear()

# plussing 'login' and 'logout' will build '/login' and '/logout'
api.add_namespace(auth_ns, path='/')

# plussing 'all' and 'add' will build '/user/all' and '/user/add'
api.add_namespace(user_ns, path='/user/')

api.add_namespace(order_ns, path='/order/')
api.add_namespace(toolbox_ns, path='/toolbox/')
