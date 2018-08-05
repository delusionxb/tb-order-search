#!/usr/bin/env python3

from flask import request
from flask_restplus import Resource, Namespace, fields
from flask_login import login_required, current_user
from app.main.model.user import User

user_ns = Namespace('user', description='user api', decorators=[login_required])
user_model = user_ns.model('user', dict(
  id = fields.Integer(required=True),
  username = fields.String(required=True),
  password = fields.String(required=True),
  email = fields.String(required=True),
))


@user_ns.route('all')
class GetAll(Resource):
  # @user_ns.marshal_list_with(user_model)
  @login_required
  def get(self):
    print('current user is {}'.format(current_user))
    return User.get_all()


@user_ns.route('add')
class AddUser(Resource):
  # @user_ns.marshal_with(user_model)
  @login_required
  def post(self):
    User(request.json).save()
    return {'result': 'success'}
