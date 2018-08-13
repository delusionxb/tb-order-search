#!/usr/bin/env python3
#
# https://www.bufeihua.cn/p/562c719432e3a80001800050
# https://api.mongodb.com/python/current/api/pymongo/collection.html
#
# 繁体和简体 中文转换
# https://blog.csdn.net/thomashtq/article/details/41512359
# https://blog.csdn.net/tab_space/article/details/50823073
#
# $and / $or example
# db.example.find({
#   '$or':[
#     {'$and':[{'example.a':{'$gt':1}},{'example.b':{'$gt':2}}]},
#     {'$and':[{'example.c':{'$gt':3}},{'example.d':{'$gt':4}}]}
#   ]
# })

import json, pymongo
from app.main import get_mongodb
from app.main.toolbox import hanZ_converter

mdb = get_mongodb('dev')


class Order:

  totalCount = mdb.subOrders.count()

  @staticmethod
  def get_mainOrders_by_page(pageNo=1, ordersPerPage=10, createDaySort=-1, indent=None):
    print('pageNo {}, ordersPerPage {}, createDaySort {}'.format(pageNo, ordersPerPage, createDaySort))
    # the command below works in mongodb shell, but not in pymongo
    # db.mainOrders.find({}, {'_id':0}).sort({'orderInfo.createDay': -1}).skip((pageNo - 1) * ordersPerPage).limit(ordersPerPage)
    #
    # pymongo.DESCENDING: -1
    # pymongo.ASCENDING: 1
    return json.dumps([mainOrder for mainOrder in
      mdb.mainOrders.find(
        {}, projection={'_id': 0},
        sort=([
          ('orderInfo.createDay', createDaySort)
        ]),
        skip=(pageNo - 1) * ordersPerPage, limit=ordersPerPage
    )], ensure_ascii=False, indent=indent)

  @staticmethod
  def populate_search_conditions(search_data):
    itemName = search_data.get('itemName', '')
    minTotalCost = search_data.get('minTotalCost', 0)
    maxTotalCost = search_data.get('maxTotalCost', 0)
    shopName = search_data.get('shopName', '')
    minCreateDay = search_data.get('minCreateDay', '')
    maxCreateDay = search_data.get('maxCreateDay', '')
    orderType = search_data.get('orderType', '')
    tradeStatus = search_data.get('tradeStatus', '')

    # print('search_data: {}'.format(search_data))
    search_conditions = {}

    # fill in itemNames fields
    if itemName:
      itemName_t = hanZ_converter.convert(itemName)
      if itemName == itemName_t:
        search_conditions['itemNames'] = {'$regex': '{}'.format(itemName), '$options': '$i'}
      else:
        search_conditions['$or'] = [
          {'itemNames': {'$regex': '{}'.format(itemName)}},
          {'itemNames': {'$regex': '{}'.format(itemName_t)}}
        ]

        # the code below will raise an error
        # pymongo.errors.OperationFailure: cannot nest $ under $in
        # searchConditions['itemNames'] = {'$in': [
        #   {'$regex': '{}'.format(itemName)},
        #   {'$regex': '{}'.format(itemName_t)}
        # ]}

    # fill in totalCost field
    totalCost = {}
    if minTotalCost:
      totalCost['$gte'] = float(minTotalCost)

    if maxTotalCost:
      totalCost['$lte'] = float(maxTotalCost)

    if totalCost:
      search_conditions['totalCost'] = totalCost

    # fill in shopName field
    if shopName:
      search_conditions['seller.shop'] = {'$regex': '{}'.format(shopName), '$options': '$i'}

    # fill in createDay field
    createDay = {}
    if minCreateDay:
      createDay['$gte'] = minCreateDay

    if maxCreateDay:
      createDay['$lte'] = maxCreateDay

    if createDay:
      search_conditions['createDay'] = createDay

    if orderType:
      search_conditions['orderType'] = orderType

    # CREATE_CLOSED_OF_TAOBAO, TRADE_CLOSED, TRADE_FINISHED
    if tradeStatus == 'closed':
      search_conditions['$or'] = [
        {'tradeStatus1': 'CREATE_CLOSED_OF_TAOBAO'},
        {'tradeStatus1': 'TRADE_CLOSED'},
      ]
    elif tradeStatus == 'finished':
      search_conditions['tradeStatus1'] = 'TRADE_FINISHED'

    return search_conditions

  @staticmethod
  def get_totalCount_by_conditions(search_data):
    search_conditions = Order.populate_search_conditions(search_data)
    print('search_conditions: {}'.format(search_conditions))
    return mdb.subOrders.find(search_conditions).count()

  @staticmethod
  def get_mainOrders_by_conditions(search_data, indent=None):
    """
    because itemName is inside each element of subOrders array in mainOrder collection
    so first search subOrders collections to get IDs of mainOrders
    then use these IDs to search mainOrders again

    how to use regex
    http://www.runoob.com/mongodb/mongodb-regular-expression.html

    :param search_data:
    :param indent:
    :return:
    """
    search_conditions = Order.populate_search_conditions(search_data)
    print('search_conditions: {}'.format(search_conditions))
    pageNo = search_data.get('pageNo', 1)
    ordersPerPage = search_data.get('ordersPerPage', 10)
    createDaySort = search_data.get('createDaySort', -1)

    subOrders = mdb.subOrders.find(
      search_conditions, projection={'_id': 0, 'id': 1},
      sort=([
        ('createDay', createDaySort)
      ]),
      skip=(pageNo - 1) * ordersPerPage, limit=ordersPerPage
    )

    mainOrders = mdb.mainOrders.find(
      {'id': {
        '$in': [subOrder.get('id') for subOrder in subOrders]
      }}, projection={'_id': 0},
      sort=([
        ('orderInfo.createDay', createDaySort)
      ])
    )

    return json.dumps([mainOrder for mainOrder in mainOrders], ensure_ascii=False, indent=indent)



def test():
  def test_get_mainOrders_by_page():
    print(Order.totalCount)
    print(Order.get_mainOrders_by_page(indent=2))

  def test_get_totalCount_by_conditions():
    conditions1 = dict(
      minTotalCost=100,
      maxTotalCost=200,
      shopName='漫画馆',
      minCreateDay='2009-04-01',
      maxCreateDay='2009-05-01',
      itemName='blame',
    )
    conditions2 = dict(
      minTotalCost=1000,
      maxTotalCost=1200,
      # shopName = '漫画馆',
      minCreateDay='2016-04-01',
      maxCreateDay='2016-09-01',
      # itemName = 'blame',
    )
    conditions3 = dict(
      # minTotalCost = 100,
      # maxTotalCost = 200,
      # shopName = '漫画馆',
      minCreateDay='2017-01-01',
      maxCreateDay='2017-03-31',
      itemName='漫画',
    )
    conditions4 = dict(
      minCreateDay = '2009-01-01',
      maxCreateDay = '2009-12-31',
      tradeStatus = 'finished',
    )
    conditions5 = dict(
      minCreateDay = '2009-01-01',
      maxCreateDay = '2009-12-31',
      tradeStatus = 'closed',
    )

    conditions_list = [
      # conditions1,
      # conditions2,
      # conditions3,
      conditions4,
      conditions5,
    ]

    for conditions in conditions_list:
      result_json_str = Order.get_mainOrders_by_conditions(conditions)
      for result in json.loads(result_json_str):
        print(result)


  # test_get_mainOrders_by_page()
  test_get_totalCount_by_conditions()


if __name__ == '__main__':
  test()
  pass
