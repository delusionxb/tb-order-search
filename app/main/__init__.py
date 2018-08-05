#!/usr/bin/env python3
#
# http://flask-login.readthedocs.io/en/latest/

from flask_login import LoginManager
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from .config import config_dict
import pymongo

db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

def get_mongodb(config_name):
  config_obj = config_dict.get(config_name)
  client = pymongo.MongoClient(config_obj.mdb_url)
  return client[config_obj.mdb_name]


def init_login_manager(app):
  login_manager.session_protection = 'strong'
  login_manager.login_view = '/login'
  login_manager.login_message = 'NO matter who you are, you need to Login first!'
  login_manager.login_message_category = 'info'
  login_manager.init_app(app)


def create_app(config_name):
  app = Flask(__name__)
  config_obj = config_dict.get(config_name)
  app.config.from_object(config_obj)

  # db.init_app(app)
  # bcrypt.init_app(app)
  # init_login_manager(app)
  return app
