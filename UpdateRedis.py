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
    try:
        cap, enr, req, wl = eval(r.get('S'+code))
    except:
        continue
    cap.append(data[0])
    if data[1] == data[0]:
        full = True
    if full:
        enr.append(data[1])
    else:
        enr.append(int((int(data[1])+int(enr[-1]))/2))
    if full:
        req.append(data[2])
    else:
        req.append(int((int(data[2])+int(req[-1]))/2))
    if full:
        wl.append(data[3])
    else:
        if data[3] == 'n/a':
            wl.append(data[3])
        else:
            wl.append(int((int(data[3])+int(wl[-1]))/2))
    r.set('S'+code, (cap, enr, req, wl))
    
print('done')  
