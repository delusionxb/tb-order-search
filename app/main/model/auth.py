#!/usr/bin/env python3
#
# https://stackoverflow.com/questions/8218484/mongodb-inserts-float-when-trying-to-insert-integer
# insert auth document
# db.security.insert({id: NumberInt(0), username: $username, 'hashed_password': $some_hashed_password})

from flask_login import UserMixin
from app.main import bcrypt, login_manager
from app.main.model import mdb


@login_manager.user_loader
def load_user(auth_id):
  return Auth.find_byID(int(auth_id))


class Auth(UserMixin):

  def __init__(self, auth_data):
    self.id = auth_data.get('id')
    self.username = auth_data.get('username')
    self.hashed_password = auth_data.get('hashed_password')

  def __repr__(self):
    return 'id: {}, username: {}, hashed_password: {}'.format(self.id, self.username, self.hashed_password)

  @staticmethod
  def find_byID(auth_id):
    return Auth(mdb.security.find_one({'id': auth_id}, {'_id': 0}))

  @staticmethod
  def validate(auth_data):
    auth_document = mdb.security.find_one({'username': auth_data.get('username')}, {'_id': 0})
    if auth_document is not None:
      if bcrypt.check_password_hash(auth_document.get('hashed_password'), auth_data.get('password')):
        return auth_document  # dict

    return None


def test():
  me = dict(
    username = 'delusionxb',
    password = 'asd5sasd5',
  )

  non_exist = dict(
    username = 'nobody',
    password = 'nothing'
  )

  print(Auth.find_byID(0))
  print(Auth.validate(me))
  print(type(Auth.validate(me)))
  print(Auth.validate(non_exist))


if __name__ == '__main__':
  # print(bcrypt.generate_password_hash('asd5sasd5').decode('utf-8'))
  test()
  pass

