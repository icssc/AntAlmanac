'''
Created on Jan 21, 2018

@author: andrewself
'''
import bs4 as bs
import urllib.request

BASE_URL = 'https://www.reg.uci.edu/perl/WebSoc?'

COURSE_CODE_INDEX = 0
MAX_INDEX = 8
ENR_INDEX = 9
WL_INDEX = 10
REQ_INDEX = 11

#sauce = urllib.request.urlopen('https://pythonprogramming.net/parsememcparseface/').read()
#soup = bs.BeautifulSoup(sauce,'lxml')

'''Gets list of names of all departments to creatre url for each department''' 
def getDepts():
    Depts = set()
    with urllib.request.urlopen(BASE_URL) as sauce:
        soup = bs.BeautifulSoup(sauce,'html.parser')
        for option in soup.find_all('select'):
            #print(option.get('name'))
            if (option.get('name') == 'Dept'):
                for name in option.find_all('option'):
                    Depts.add(name.get('value'))
        return Depts


'''creates url for each department'''
def getURL(depts):
    urls = set()
    for i in sorted(depts):
        #print(i)
        fields=[('YearTerm','2018-14'),('ShowFinals','1'),('ShowComments','1'),('Dept',i)]
        url = BASE_URL + urllib.parse.urlencode(fields)
        #print(url)
        urls.add(url)
    return urls


'''for each url, creates a dictionary {coursecode: (max, enrolled, waitlisted, requests)}'''
def UrlToDict(url):
    codes={}
    sauce = urllib.request.urlopen(url).read()
    soup = bs.BeautifulSoup(sauce, 'html.parser')
    for tr in soup.find_all('tr'):
        #print(tr)
        classes = [td.string for td in tr.find_all('td')]
        if (len(classes)==17 and classes[3] != '0'):
            #print(classes)
            code = classes[COURSE_CODE_INDEX]
            cap = classes[MAX_INDEX]
            enr = classes[ENR_INDEX]
            if '/' in enr:
                enr = enr[enr.find('/ ')+2:]
            wl = classes[WL_INDEX]
            req = classes[REQ_INDEX]
            codes[code] = (cap,enr,req,wl)
    #print(codes)   
    #print(url)
    return codes
    
'''combines dictionary of every department'''
def getAllInfo(urls):
    all_info = {}
    for url in urls:
        info= UrlToDict(url)
        for k,v in info.items():
            all_info[k]=v
    return all_info

'''prints master dictionary'''
def print_dict(info):
    for k,v in info.items():
        print(k,v)
    print(len(info))
                
if __name__ == '__main__':
    departments = getDepts()
    urls = getURL(departments)
    master_dict=getAllInfo(urls)
    print_dict(master_dict)
    
