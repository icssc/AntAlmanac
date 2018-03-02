import os
from urllib.parse import urlparse
import SummerSOCSpider
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
print('*****Doggo\'s doing its thing*****')
for session in [('S1','2018-25'), ('S10','2018-39'), ('S2','2018-76')]:
    master_dict = SummerSOCSpider.getAllInfo(SummerSOCSpider.getURL(SummerSOCSpider.getDepts(), session[1]))
    for code, data in master_dict.items():
        print(code,end=' ')
        r.set(session[0]+code, ([data[0]], [data[1]], [data[2]], [data[3]]))
    
print('done')    
