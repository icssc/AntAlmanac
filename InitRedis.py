import os
from urllib.parse import urlparse
import redis

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

with open('corrected.txt') as data:
  code = data.readline().strip()
  while code != '=====':
    
    cap = data.readline().split()
    enr = data.readline().split()
    wl = data.readline().split()
    
    r.set(code, (cap,enr,wl))
    
    code = data.readline().strip()
