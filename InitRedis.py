import os
from urllib.parse import urlparse
import SOCSpider
import redis

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)

# r.flushall()

# with open('corrected.txt') as data:
#   code = data.readline().strip()
#   while code != '=====':
    
#     print(code,end=' ')
    
#     cap = data.readline().split()
#     enr = data.readline().split()
#     req = data.readline().split()
#     wl = data.readline().split()
    
#     r.set('W'+code, (cap,enr,req,wl))
    
#     code = data.readline().strip()
    
#input new
master_dict = SOCSpider.getAllInfo(SOCSpider.getURL(SOCSpider.getDepts()))
for code, data in master_dict.items():
    print(code,end=' ')
    r.set('S'+code, ([int(int(data[0])/2)], [int(int(data[1])/2)], [int(int(data[2])/2)], ['n/a' if data[3] == 'n/a' else int(int(data[3])/2)]))
    
print('done')    
