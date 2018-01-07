#!/usr/bin/python3.6
from pathlib import Path
from datetime import datetime, date, timedelta
import urllib.request
import time
from collections import OrderedDict
from html.parser import HTMLParser
STORE_PATH = Path('W18')
NUM_CODES = 10

class SingleResultParser(HTMLParser):
    codes = []
    c_code = ''
    result = OrderedDict()
    in_row = False
    col = 0

    def initialize(self, new_codes):
        if new_codes == []:
            return
        self.codes = sorted(new_codes)
        self.c_code = self.codes[0]
        self.result = OrderedDict()
        for code in self.codes:
            self.result[code]=['0','0','0','0']
        self.in_row = False
        self.col = 0

    def handle_starttag(self, tag, attrs):
        if self.in_row and tag == 'td':
            self.col += 1

    def handle_endtag(self, tag):
        if tag == 'table':
            for code, info in self.result.items():
                if not str(info[3]).isnumeric() and info[3].strip() != 'n/a':
                    self.result[code][3] = info[2]
                    self.result[code][2] = 'n/a'
                if '/' in str(info[1]):
                    self.result[code][1] = int(info[1][info[1].find('/ ')+2:])

    def handle_data(self, data):
        if data in self.codes:
            self.c_code = data
            self.in_row = True
            self.col = 1
        if self.in_row:
            if self.col == 8:
                self.result[self.c_code] = [data] #max
            elif self.col == 9:
                self.result[self.c_code].append(data) #enr
            elif self.col == 10:
                self.result[self.c_code].append(data) #wl
            elif self.col == 11:
                self.result[self.c_code].append(data) #req
                self.col = 0
                self.in_row = False

    def fetch(self, codes):
        self.initialize(codes)
        if self.codes == []:
            return {}
        base_url = 'https://www.reg.uci.edu/perl/WebSoc?'
        fields = [('YearTerm','2018-03'), ('CourseCodes',','.join(codes))]
        raw_info = 0
        while True:
            try:
                raw_info = urllib.request.urlopen(base_url + urllib.parse.urlencode(fields))
                data = raw_info.read().decode()
                self.feed(data)
                break
            except:
                time.sleep(2)
        raw_info.close()
        return self.result


def fetch_old():
    yesterdate = date.today()-timedelta(1)
    in_file = (STORE_PATH/Path(str(yesterdate.month)+'-'+str(yesterdate.day)+'.txt')).open('r')
    return in_file

def start_blank(*name):
    hora = date.today()
    if len(name) == 0:
        file_name = str(hora.month)+'-'+str(hora.day)+'.txt'
    else:
        file_name = name[0]+'.txt'
    out_file = (STORE_PATH/Path(file_name)).open('w')
    return out_file

def update():
    in_file = fetch_old()
    out_file = start_blank()
    doggo = SingleResultParser()
    done = False
    while not done:
        search = []
        checkpt = in_file.tell()
        for i in range(NUM_CODES):
            c_code = in_file.readline().strip()
            if c_code == '=====':
                done = True
                break
            search.append(c_code)
            for j in range(4):
                in_file.readline()

        poop = doggo.fetch(search)
        in_file.seek(checkpt)
        for i in range(NUM_CODES):
            if_code = in_file.readline().strip()
            if if_code == '=====':
                break
            code = if_code
            out_file.write(code+'\n')

            past_max_rec = in_file.readline().strip()
            past_max = past_max_rec.split()[-1]

            if poop[code][0] != past_max:
                out_file.write(past_max_rec+' ('+str(date.today())+') '+poop[code][0]+'\n')
            else:
                out_file.write(past_max_rec+'\n')

            past_enr = in_file.readline().strip()
            num_days = len(past_enr.split())
            out_file.write(past_enr + ' ' + str(poop[code][1]) + '\n')

            past_req = in_file.readline().strip()
            out_file.write(past_req + ' ' + str(poop[code][3]) + '\n')

            past_wl = in_file.readline().strip()
            cur_wl = str(poop[code][2])
            if past_wl.split()[-1] != 'n/a':
                out_file.write(past_wl + ' ' + cur_wl + '\n')
            else:
                if cur_wl.strip() != 'n/a':
                    for i in range(num_days):
                        out_file.write('0 ')
                    out_file.write(cur_wl.strip()+'\n')
                else:
                    out_file.write(past_wl + '\n')
        out_file.flush()
    in_file.close()
    out_file.write('=====')
    out_file.close()

if __name__ == '__main__':
    print(datetime.now())
    update()
    print(datetime.now())
