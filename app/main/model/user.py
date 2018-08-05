#!/usr/bin/env python3
#
# http://flask.pocoo.org/docs/1.0/patterns/sqlalchemy/
# https://stackoverflow.com/questions/45259764/how-to-create-a-single-table-using-sqlalchemy-declarative-base
#
# to test db operations without running flask app, do either the way in test() function
# or follow steps in sqlalchemy doc linked above
# NOTE: db.create_all() does nothing without model class definition found in same python module
#
# https://baagee.vip/index/article/id/62.html
# https://flask-login.readthedocs.io/en/latest/


import json
from flask_login import UserMixin
from app.main import db, bcrypt, login_manager


@login_manager.user_loader
def load_user(user_id):
  return User.find_byID(user_id)


class User(db.Model, UserMixin):
  """
  sqlalchemy.exc.InvalidRequestError: Table 'xxx' is already defined for this MetaData instance.
  Specify 'extend_existing=True' to redefine options and columns on an existing Table object.
  """
  __table_args__ = dict(
    mysql_charset='utf8',
    extend_existing=True
  )
  id = db.Column(db.Integer, primary_key=True, autoincrement=True)
  username = db.Column(db.String(100), unique=True, nullable=False)
  password_hashed = db.Column(db.String(200), nullable=False)
  email = db.Column(db.String(120), unique=True, nullable=False)

  def __init__(self, user_data):
    self.username = user_data.get('username')
    self.password = user_data.get('password')
    self.email = user_data.get('email')

  @property
  def password(self):
    raise AttributeError('password: write-only field')

  @password.setter
  def password(self, password):
    self.password_hashed = bcrypt.generate_password_hash(password).decode('utf-8')

  def check_password(self, password):
    return bcrypt.check_password_hash(self.password_hashed, password)

  def save(self):
    db.session.add(self)
    db.session.commit()

  @classmethod
  def check_login(cls, user_data):
    user = User.query.filter_by(username=user_data.get('username')).first()
    if user is not None:
      if user.check_password(user_data.get('password')):
        return user
      else:
        return False

  @classmethod
  def find_byID(cls, user_id):
    return User.query.get(user_id)

  @classmethod
  def get_all(cls):
    users = [user.__repr__() for user in User.query.all()]
    return '[{}]'.format(', '.join(users))

  def __repr__(self):
    return json.dumps(dict(
      id = self.id,
      username = self.username,
      password_hashed = self.password_hashed,
      email = self.email,
    ))



def test():
  from app.main.config import DevConfig
  from flask import Flask
  app = Flask(__name__)
  app.config.from_object(DevConfig)
  db.init_app(app)
  app.app_context().push()
  # engine = db.create_engine(DevConfig.SQLALCHEMY_DATABASE_URI)

  def test_create_table():
    User.__table__.create(db.engine)

  def test_drop_table():
    User.__table__.drop(db.engine)

  def test_insert():
    admin = User(dict(
      username = 'admin',
      password = 'admin',
      email = 'admin@flask.com'
    ))
    db.session.add(admin)

    guest = User(dict(
      username='guest',
      password='guest',
      email='guest@flask.com'
    ))
    db.session.add(guest)

    db.session.commit()

  def test_check_login():
    print(User.check_login(dict(
      username = 'admin',
      password = 'admin',
    )))
    print(User.check_login(dict(
      username='scott',
      password='tiger',
    )))

  def test_get_all():
    print(User.get_all())

  def test_find_byID():
    user = User.find_byID(3)
    print(type(user))
    print(type(user.__repr__()))



  # test_create_table()
  # test_drop_table()
  # test_insert()

  # db.metadata.clear()
  # test_check_login()
  test_get_all()
  # test_find_byID()

if __name__ == '__main__':
  test()
  pass

