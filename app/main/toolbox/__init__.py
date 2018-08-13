#!/usr/bin/env python3

from app.main.toolbox.langconv import *
import json

hanZ_converter = Converter('zh-hant') # 简 -> 繁

def get_404_images():
  # https://stackoverflow.com/questions/15233340/getting-rid-of-n-when-using-readlines
  print('toolbox.get_404_images()')
  with open('app/main/static/404_images.txt', 'r') as four_04:  # if run by main_app
    return json.dumps([line.rstrip() for line in four_04])


if __name__ == '__main__':
  with open('../static/404_images.txt', 'r') as four_04:  # if run directly
    print(json.dumps([line.rstrip() for line in four_04]))
  pass
