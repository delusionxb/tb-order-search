## How to deploy onto Ubuntu 16.04

### Python3
- Python3 version should be at least 3.5.1 (python3 -V)
- If not, install Python3 by official binary or by Miniconda3
  - https://www.python.org/downloads/
  - https://conda.io/miniconda.html

### Install project
- clone from github
  - git clone git@github.com:delusionxb/tb-order-search.git
- install pip3
  - apt install python3-pip (if python3 comes with os)
  - pip3 is already there (if python3 installed by Miniconda3)
- install python3 3rd-party libraries
  - pip3 install -r /somewhere/tb-order-search/requirements.txt

### Prepare Static Resources
- item-images
  - scp /Users/frank/python/spider/item-images.tgz to target machine
  - tar zxf /somewhere/item-images.tgz -C /somewhere/tb-order-search
  - start nginx, prepare config.js and gunicorn.conf, run 'sudo /somewhere/tb-order-search/deploy/prepare.sh prepare'
- mainOrders and subOrders in mongodb
  - download mongodb from https://www.mongodb.com/download-center#community
  - unpack to /somewhere/mongodb-linux-x86_64-xyz
  - cp /somewhere/tb-order-search/deploy/mongod.* /somewhere/mongodb-linux-x86_64-xyz
  - start mongodb, run '/somewhere/mongodb-linux-x86_64-xyz/mongod.sh up'
  - import data, run '/somewhere/tb-order-search/deploy/mongo_handler.py'
  - try to connect to remote mongodb by client tool like Robo 3T

### Start or stop tb-order-search
- start '/somewhere/tb-order-search/deploy/prepare.sh gstart'
- stop '/somewhere/tb-order-search/deploy/prepare.sh gstop'
