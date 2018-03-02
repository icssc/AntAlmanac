import os
from urllib.parse import urlparse
import SummerSOCSpider
import redis

url = urlparse(os.environ.get('REDISCLOUD_URL'))
r = redis.Redis(host=url.hostname, port=url.port, password=url.password)
    
#input new
print('=====================================')
print('doggos is working on it right now')
for session in [('S1','2018-25'), ('S10','2018-39'), ('S2','2018-76')]:
    master_dict = SummerSOCSpider.getAllInfo(SummerSOCSpider.getURL(SummerSOCSpider.getDepts(), session[1]))
    for code, data in master_dict.items():
        print(code,end=' ')
        try:
            cap, enr, req, wl = eval(r.get(session[0]+code))
        except:
            continue
        new_req = data[2]
        new_wl = data[3]
        try:
            temp = int(new_req)
        except:
            new_req = new_wl
            new_wl = 'n/a'
        cap.append(data[0])
        enr.append(data[1])
        req.append(new_req)
        wl.append(new_wl)
        r.set(session[0]+code, (cap, enr, req, wl))
    
print('done')  
