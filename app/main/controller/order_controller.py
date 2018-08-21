#!/usr/bin/env python3

from flask import request
from flask_restplus import Resource, Namespace, fields
from flask_login import login_required, current_user
from app.main.model.order import Order
from app.main.toolbox import get_404_images

order_ns = Namespace('order', description='order api')


@order_ns.route('totalCount_byConditions')
class GetTotalCountByConditions(Resource):
  @login_required
  @order_ns.expect(order_ns.model('GetTotalCountByConditions', dict(
    itemName=fields.String,
    minTotalCost=fields.Integer(description='min total cost', request=False),
    maxTotalCost=fields.Integer,
    shopName=fields.String,
    minCreateDay=fields.String,
    maxCreateDay=fields.String,
  )))
  def post(self):
    print('GetTotalCountByConditions() -> payload from request: {}'.format(request.json))
    print('the current logged in user is [{}]'.format(current_user))
    return Order.get_totalCount_by_conditions(request.json)


@order_ns.route('byConditions')
class GetOrdersByConditions(Resource):
  @login_required
  @order_ns.expect(order_ns.model('GetOrdersByConditions', dict(
    itemName = fields.String,
    minTotalCost = fields.Integer(description='min total cost', request=False),
    maxTotalCost = fields.Integer(description='max total cost', request=False),
    shopName = fields.String,
    minCreateDay = fields.String,
    maxCreateDay = fields.String,
    orderType = fields.String,
    tradeStatus = fields.String,
    pageNo = fields.Integer,
    ordersPerPage = fields.Integer,
    createDaySort = fields.Integer,
  )))
  def post(self):
    print('GetOrdersByConditions() -> payload from request: {}'.format(request.json))
    mainOrders = Order.get_mainOrders_by_conditions(request.json)
    print('the current logged in user is [{}]'.format(current_user))
    return '{{"mainOrders": {}, "404_images": {}}}'.format(mainOrders, get_404_images())


@order_ns.route('totalCount')
class GetTotalCount(Resource):
  @login_required
  def get(self):
    print('GetTotalCount()')
    print('the current logged in user is [{}]'.format(current_user))
    return Order.totalCount


@order_ns.route('byPage')
class GetOrdersByPage(Resource):
  """
  even if shown on swagger UI like follows
  request.args still get ImmutableMultiDict([('pageNo', '1'), ('ordersPerPage', '5')]) back

  Parameters
  Name	      Description
  pageNo      page no
  integer
  (query)

  ordersPerPage    orders per page
  integer
  (query)
  """
  parser = order_ns.parser()
  parser.add_argument('pageNo', type=int, help='page no')
  parser.add_argument('ordersPerPage', type=int, help='orders per page')
  parser.add_argument('createDaySort', type=int, help='create day sorting')

  @login_required
  @order_ns.expect(parser)
  def get(self):
    print('GetOrdersByPage() -> args from request: {}'.format(request.args))
    print('the current logged in user is [{}]'.format(current_user))
    json_data = request.args
    mainOrders = Order.get_mainOrders_by_page(
      pageNo=int(json_data.get('pageNo')),
      ordersPerPage=int(json_data.get('ordersPerPage')),
      createDaySort=int(json_data.get('createDaySort'))
    )
    return '{{"mainOrders": {}, "404_images": {}}}'.format(mainOrders, get_404_images())
