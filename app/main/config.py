#!/usr/bin/env python3

import socket

class Config:
  DEBUG = False
  SECRET_KEY = 'A brown quick FOX jumps over the lazy DOG.'
  SALT = 'Fox_Dog'


class DevConfig(Config):
  # http://flask.pocoo.org/docs/1.0/config/#SERVER_NAME
  # https://stackoverflow.com/questions/20792499/how-to-get-fully-qualified-host-name-in-python

  hostname = socket.getfqdn()
  domain_name = '.9ztrade.com'
  if hostname in ['production-02', 'production-03', 'production-04']:
    hostname += domain_name

  SERVER_NAME = '{}:7770'.format(hostname)
  DEBUG = True

  db_credential = 'scott:tiger'
  db_host = '127.0.0.1:3306'
  db_name = 'sqlalchemy_test'
  SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{}@{}/{}?charset=utf8'.format(db_credential, db_host, db_name)
  SQLALCHEMY_TRACK_MODIFICATIONS = False

  mdb_host = 'localhost:27017'
  mdb_url = 'mongodb://{}'.format(mdb_host)
  mdb_name = 'delusionxb'


class ProductionConfig(Config):
  pass


config_dict = dict(
  dev = DevConfig,
  product = ProductionConfig,
)
