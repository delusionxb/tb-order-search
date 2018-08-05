#!/usr/bin/env python3
#
# https://stackoverflow.com/questions/10434599/how-to-get-data-received-in-flask-request
# https://stackoverflow.com/questions/20001229/how-to-get-posted-json-in-flask

from flask import request
from flask_restplus import Resource, Namespace, fields
from flask_login import login_user, logout_user, login_required
from app.main.model.user import User


auth_ns = Namespace('auth', description='authentication api')
auth_model = auth_ns.model('auth_model', dict(
  email = fields.String(required=True),
  password = fields.String(required=True)
))


@auth_ns.route('login')
class Login(Resource):
  def post(self):
    # to user request.json, client needs to explicitly specify data type like follows
    # Content-Type: application/json; charset=UTF-8
    # request.data is also usable, but in bytes
    user = User.check_login(request.json)
    if user:
      login_user(user)
      return dict(
        login = 'success'
      )
    else:
      return dict(
        login = 'failure'
      )


@auth_ns.route('logout')
class Logout(Resource):
  @login_required
  def post(self):
    logout_user()
    return dict(
      logout = 'success'
    )
