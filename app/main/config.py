#!/usr/bin/env python3

class Config:
  DEBUG = False
  SECRET_KEY = 'A brown quick FOX jumps over the lazy DOG.'
  SALT = 'Fox_Dog'


class DevConfig(Config):
  SERVER_HOST = '0.0.0.0'
  SERVER_PORT = 7770
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
