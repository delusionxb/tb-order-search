#!/usr/bin/env python3
#
# https://stackoverflow.com/questions/10434599/how-to-get-data-received-in-flask-request
# https://stackoverflow.com/questions/20001229/how-to-get-posted-json-in-flask

from flask import request
from flask_restplus import Resource, Namespace, fields
from flask_login import login_user, logout_user, login_required, current_user
from app.main.model.user import User
from app.main.model.auth import Auth
from datetime import timedelta


auth_ns = Namespace('auth', description='authentication api')
auth_model = auth_ns.model('auth_model', dict(
  email = fields.String(required=True),
  password = fields.String(required=True)
))


@auth_ns.route('login')
class Login(Resource):
  @auth_ns.expect(auth_ns.model('Login', dict(
    username = fields.String,
    password = fields.String,
    rememberMe = fields.Boolean,
  )))
  def post(self):
    auth_document = Auth.validate(request.json)
    if auth_document is None:
      print('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN FAILED')
      return None

    # https://flask-login.readthedocs.io/en/latest/#remember-me
    # https://docs.python.org/3/library/datetime.html#datetime.timedelta
    print('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGIN SUCCEEDED')
    rememberMe = request.json.get('rememberMe')
    if rememberMe:
      print('remember ME')  # remember ME does not work, donno why yet...
      login_user(Auth(auth_document), remember=True, duration=timedelta(weeks=1))  # login_user() requires an object
    else:
      print('don\'t remember ME')
      login_user(Auth(auth_document))
    print('the current logged in user is [{}]'.format(current_user))
    return auth_document


@auth_ns.route('logout')
class Logout(Resource):
  @login_required
  def post(self):
    logout_user()
    print('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+ LOGOUT SUCCEEDED')
    return dict(
      logout = 'success'
    )


def legacy():
  @auth_ns.route('login1')
  class Login1(Resource):
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

  @auth_ns.route('logout1')
  class Logout1(Resource):
    @login_required
    def post(self):
      logout_user()
      return dict(
        logout = 'success'
      )
