#!/usr/bin/env python3

from flask import request
from flask_restplus import Resource, Namespace
from app.main.toolbox import hanZ_converter

toolbox_ns = Namespace('toolbox', description='toolbox api')


@toolbox_ns.route('hanZS2T')
class ConvertHanZS2T(Resource):
  @toolbox_ns.doc(params=dict(
    hanZ = 'simplified chinese characters',
  ))
  def get(self):
    """
    convert simplified chinese characters to traditional chinese characters
    """
    return hanZ_converter.convert(request.args.get('hanZ'))
