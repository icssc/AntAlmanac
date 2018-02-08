import os
from urllib.parse import urlparse
import redis

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

r.flushall()

with open('corrected.txt') as data:
  code = data.readline().strip()
  while code != '=====':
    
    print(code,end=' ')
    
    cap = data.readline().split()
    enr = data.readline().split()
    req = data.readline().split()
    wl = data.readline().split()
    
    r.set('W'+code, (cap,enr,req,wl))
    
    code = data.readline().strip()
    
    
print('done')    
