import os
from urllib.parse import urlparse
import SOCSpider
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
        cap.append(data[0])
        enr.append(data[1])
        req.append(data[2])
        wl.append(data[3])
        r.set(session[0]+code, (cap, enr, req, wl))
    
print('done')  
