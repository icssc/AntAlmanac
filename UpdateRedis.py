import os
from urllib.parse import urlparse
import SOCSpider
import redis

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)
    
#input new
print('=====================================')
print('doggos is working on it right now')
master_dict = SOCSpider.getAllInfo(SOCSpider.getURL(SOCSpider.getDepts()))
print('got it!')
print('=====================================')

for code, data in master_dict.items():
    print(code,end=' ')
    cap, enr, req, wl = eval(r.get('S'+code))
    cap.append(data[0])
    enr.append(data[1])
    req.append(data[2])
    wl.append(data[3])
    r.set('S'+code, (cap, enr, req, wl))
    
print('done')  
