import os
from urllib.parse import urlparse
import SOCSpider
import redis

r = redis.from_url(os.environ.get('REDISCLOUD_URL'))

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
print('*****Doggo\'s doing its thing*****')
master_dict = SOCSpider.getAllInfo(SOCSpider.getURL(SOCSpider.getDepts()))
for code, data in master_dict.items():
    print(code,end=' ')
    r.set('F'+code, ([data[0]], [data[1]], [data[2]], [data[3]]))
    
print('done')    
