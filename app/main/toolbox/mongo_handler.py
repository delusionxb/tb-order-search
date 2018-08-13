#!/usr/bin/env python3
#
# resources worth digging
# http://python-eve.org/quickstart.html
# https://docs.mongodb.com/v3.6/mongo/

import pymongo
import os, json, glob

db = None
client = None

def initialize():
  global db, client
  print('creating db client')
  client = pymongo.MongoClient('mongodb://localhost:27017')

  print('defining db, will create db if not exist, but invisible if not tables exist')
  db = client['delusionxb']


def insert_mainOrders():
  main_orders_path = '{}/python/spider/main-orders'.format(os.getenv('HOME'))
  for json_file in glob.glob('{}/*/*json'.format(main_orders_path)):
    print('insert json data from file {}'.format(json_file))
    json_data = json.load(open(json_file, 'r'))
    json_data['totalCost'] = float(json_data.get('﻿payInfo').get('﻿actualFee'))
    db.mainOrders.insert(json_data)
    # print(json_data)
  pass


def insert_subOrders():
  main_orders_path = '{}/python/spider/main-orders'.format(os.getenv('HOME'))
  for json_file in glob.glob('{}/*/*json'.format(main_orders_path)):
    print('insert json data from file {}'.format(json_file))
    json_data = json.load(open(json_file, 'r'))

    # 'lottery' orders do not have 'seller'
    seller = json_data.get('seller')
    if seller is None:
      seller = {}
    else:
      seller = dict(
        nick = json_data.get('seller').get('nick'),
        shop = json_data.get('seller').get('shopName'),
      )

    payInfo = json_data.get('payInfo')

    sub_orders = dict(
      id = json_data.get('id'),
      # CREATE_CLOSED_OF_TAOBAO, TRADE_CLOSED, TRADE_FINISHED
      tradeStatus1 = json_data.get('extra').get('tradeStatus'),
      tradeStatus2 = json_data.get('statusInfo').get('text'),
      createDay = json_data.get('orderInfo').get('createDay'),
      actualFee = json_data.get('payInfo').get('actualFee'),
      totalCost = float(payInfo.get('actualFee')),
      seller = seller,
      itemNames = [subOrder.get('itemInfo').get('title') for subOrder in json_data.get('subOrders')],
      orderType = 'virtual' if 'postType' in payInfo else 'real',
    )
    db.subOrders.insert(sub_orders)
    # print(sub_orders)
  pass


def update_subOrders():
  main_orders_path = '{}/python/spider/main-orders'.format(os.getenv('HOME'))
  for json_file in glob.glob('{}/*/*json'.format(main_orders_path)):
    print('update json data from file {}'.format(json_file))
    json_data = json.load(open(json_file, 'r'))
    payInfo = json_data.get('payInfo')
    # print('payInfo: {}'.format(payInfo))
    db.subOrders.update_many(
      {'id': json_data.get('id')}, {
        '$set': {'orderType': 'virtual' if 'postType' in payInfo else 'real'}
      }
    )

  pass


def test1():
  json_data = json.load(open('/Users/frank/python/spider/main-orders/2009/2009-04-03_1654429193.json', 'r'))
  print(json_data.get('payInfo'))


def search():
  # to find() without any condition == to get all documents back
  # db.mainOrders.find()

  # get the number of results from find()
  # db.mainOrders.find().count()
  # or save results first and get count number later
  # documents = db.mainOrders.find()
  # count = documents.count()

  # get first 10 documents from desc ordering by 'createDay', or by auto-generated '_id'
  # ﻿db.subOrders.find().sort({'createDay':-1}).limit(10)
  # ﻿db.subOrders.find().sort({_id:-1}).limit(10)

  # filter out '_id' from results, you cannot specify both 0 and 1 except '_id', otherwise there will be
  # "pymongo.errors.OperationFailure: Projection cannot have a mix of inclusion and exclusion."
  # either {'_id': 0, name: 1, age: 1} or {name: 0, age: 0}, other fields are 1 by default
  # ﻿db.subOrders.find({}, {'_id': 0})

  # regular expression
  # ﻿db.subOrders.find({'seller.shop': {'$regex': '^.*漫画.*$'}})
  # https://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query
  # db.subOrders.find({subOrders: {$regex: /^.*blame.*$/i}})

  # lt, lte
  # db.subOrders.find({'createDay': {'$lte': '2009-05-31'}})

  # https://docs.mongodb.com/manual/tutorial/getting-started/
  # if subOrders is an array
  # {subOrders: 'BLAME'} will find if an element it 'subOrders' is 'BLAME'
  # or use regex like follows if that element is something like 'ab BLAME xyz'
  # db.subOrders.find({subOrders: {'$regex': 'BLAME'}})
  # use [] to find if subOrders has exact elements
  # db.subOrders.find({subOrders: ["［e世代漫画王］BLAME!探索者(1-10)END~貳瓶勉~全新特价收藏良"]})

  # print('get total count of documents: {}'.format(db.mainOrders.find().count()))

  documents = db.subOrders.find({'seller.shop': {'$regex': '^.*台版漫画馆.*$'}})
  print('total {} documents returned'.format(documents.count()))
  for document in documents:
    print(document)
  pass


if __name__ == '__main__':
  initialize()
  # insert_mainOrders()
  # insert_subOrders()
  update_subOrders()
  # search()

  # test1()
  pass