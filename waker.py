import urllib.request
from datetime import datetime

now_time = datetime.now().time()
print(now_time)
if now_time > datetime.strptime('15:00', '%H:%M').time() and now_time < datetime.strptime('23:59', '%H:%M').time():
    try:
        data = urllib.request.urlopen('https://buttertesting.herokuapp.com/')
        data.read()
        data.close()
    except:
        pass
    print('woke')
else:
    print ('aint time yet')
