from flask import Flask, render_template, url_for, request, jsonify
from flask_pymongo import PyMongo
import time
from datetime import datetime, date, timedelta
import pygal
from pygal.style import DefaultStyle
import urllib.request, html, urllib.parse
import bs4 as bs
import os
from urllib.parse import urlparse

app = Flask(__name__)

app.config['MONGO_DBNAME'] = os.environ.get('MONGODB_NAME')
app.config['MONGO_URI'] = os.environ.get('MONGODB_URI')

#mongo = PyMongo(app)

def get_rela_dates(abs_dates):
    result, weeks = [], ['8','9','T','f','1','2']
    wk_ind, day = 0, 0
    for i in range(abs_dates):
        result.append('{}{}'.format('MTWTFSS'[day],weeks[wk_ind]))
        day += 1
        if day == 7 or i == 25:
            day = 0
            wk_ind +=1
    return result

def mkgraph(code):
	bu = os.environ.get('PORTOFCALL')
	try:
		inf = urllib.request.urlopen(bu.format('w','18',code))
	except:
		chart = pygal.Line(no_data_text='Course Not Found',
			   style=DefaultStyle(no_data_font_size=40))
		chart.add('line', [])
		return chart.render_data_uri()
	src = inf.read()
	inf.close()
	return src.decode('utf-8')

def get_course_info(code):
	base_url = 'https://www.reg.uci.edu/perl/WebSoc?'
	fields = [('YearTerm','2018-03'), ('CourseCodes',code)]
	sauce = urllib.request.urlopen(base_url + urllib.parse.urlencode(fields))
	soup = bs.BeautifulSoup(sauce, 'html.parser')
	temp=str(soup.find('td',{'class':'CourseTitle'}))
	temp = temp[temp.find('>')+1:]
	temp = temp[:temp.find('<')].split()
	return ' '.join(temp[:-1]),temp[-1]

def cook_quarter(quarter):
	l = quarter.split()
	if l[0]=='Fall':
		return 'F'+quarter[-2:]
	if l[0]=='Winter':
		return 'W'+quarter[-2:]
	if l[0]=='Spring':
		return 'S'+quarter[-2:]
	if l[0]=='Summer':
		if l[2]=='1,':
			return 'SS1'+quarter[-2:]
		if l[2]=='2,':
			return 'SS2'+quarter[-2:]
	return 'S10'+quarter[-2:]

def get_hist(dept,num):
	base_url = 'https://www.reg.uci.edu/perl/EnrollHist.pl?'
	fields = [('dept_name',dept),('course_no',num),('class_type',''),('action','Submit')]
	sauce = urllib.request.urlopen(base_url + urllib.parse.urlencode(fields))
	soup = bs.BeautifulSoup(sauce, 'html.parser')
	res = ''
	cur_q = ''
	for row in soup.find_all('tr'):
		r = row.find_all('td')
		if len(r) == 15 and r[5].text.strip() != 'DIS':
			sp = bs.BeautifulSoup(urllib.request.urlopen(r[2].find('a').get('href')),'html.parser')
			new_q = cook_quarter(sp.find('h3',{'style':'display: inline;'}).text)
			res += '<tr bgcolor=\'#FFFFCC\'>'
			if new_q != cur_q:
				res += '<td bgcolor=\'#FFFFFF\'><span style=\'font-size: 14px;\'>'
				res += new_q
				res += '</span></td>'
				cur_q = new_q
			else:
				res +='<td bgcolor=\'#FFFFFF\'></td>'
			div = sp.find('div', {'class':'course-list'})
			l = div.find('tr', {'valign':'top', 'bgcolor':'#FFFFCC'})
			if l:
				cells = l.find_all('td')
				if cells[3].text != '0':
					res += str(cells[0]) + str(cells[4]) + str(cells[5])
					res += str(cells[7]) + str(cells[8])
					if len(cells) == 14:
						res += str(cells[9])
						res += str(cells[12])
					elif len(cells) == 15:
						res += str(cells[10])
						res += str(cells[13])
			res += '</tr>'
	return res+'</table>'

def js_encode(string):
	if ' ' in string:
		string = string[:string.find(' ')]+'zz'+string[string.find(' ')+1:]
	if '&' in string:
		string = string[:string.find('&')]+'qq'+string[string.find('&')+5:]
	return string

def js_decode(string):
	if 'zz' in string:
		string = string[:string.find('zz')]+' '+string[string.find('zz')+2:]
	if 'qq' in string:
		string = string[:string.find('qq')]+'&'+string[string.find('qq')+2:]
	return string

def gen_almanac_listing(dept='',ge='',num='',code=''):
	url = 'https://www.reg.uci.edu/perl/WebSoc?'
	fields = [('YearTerm','2018-03'),('ShowFinals','1'),('ShowComments','1')]
	if code != '':
		fields.append(('CourseCodes',code))
		r = '<h4>You searched for the code(s): {}</h4>'.format(code)
	elif ge != '':
		fields.append(('Breadth',ge))
		r = '<h4>You searched for the breadth: {}</h4>'.format(ge)
	elif num != '':
		fields.extend([('Dept',dept),('CourseNum',num)])
		r = '<h4>You searched in the {} department for the course(s): {}</h4>'.format(dept,num)
	else:
		fields.append(('Dept',dept))
		r = '<h4>You searched for the {} department</h4>'.format(dept)
	sauce = urllib.request.urlopen(url + urllib.parse.urlencode(fields))
	sp = bs.BeautifulSoup(sauce, 'html.parser')
	for div in sp.find_all('div'):
		if div.text.strip() == 'No courses matched your search criteria for this term.':
			chart = pygal.Line(no_data_text='Nothing Matched Your Search', style=DefaultStyle(no_data_font_size=40))
			chart.add('line', [])
			r += '<br><h5>Nothing. We Ain\'t Found Nothing. At least for this quarter.</h5>'
			return [(r,chart.render_data_uri(),'','')]
	res = []
	cur_num = ''
	for row in sp.find_all('tr', {'class':''}):
		if row.find('td', {'class':'Comments'}) == None or row.find('table') != None:
			cells = row.find_all('td')
			if len(cells)==9:
				continue
			r += str(row)
			if len(cells) != 0 and len(cells[0].text) == 5 and cells[3].text != '0':
				code = cells[0].text
				r+='<tr><td colspan = 16>'
				if '199' in cur_num or (cells[2].text.isnumeric() and int(cells[2].text)>4):
					r += 'DATA HIDDEN'
				else:
					res.append((r,mkgraph(code),js_encode(dept),cur_num))
					r = ''
			elif row.find('td', {'class':'CourseTitle'}) != None:
				temp = str(row.find('td', {'class':'CourseTitle'}))
				temp = temp[temp.find('>')+1:]
				temp = temp[:temp.find('<')].split()
				cur_num = temp[-1]
				if dept != ' '.join(temp[:-1]):
					dept = ' '.join(temp[:-1])
	return res



@app.route('/_db', methods=['GET','POST'])
def _db():
	val = None
	if request.method == 'POST':
		url = urlparse(os.environ.get('REDISCLOUD_URL'))
		val = eval(redis.Redis(host=url.hostname, port=url.port, password=url.password).get(request.form['key']))
	return render_template('db.html', val=val)


@app.route('/_course_hist', methods=['GET','POST'])
def _course_hist():
	record = None
	if request.method == 'POST':
		dept = request.form['dept']
		num = request.form['num']
		record=get_hist(js_decode(dept),num)
	return render_template('course_hist.html',record=record)

@app.route('/soc', methods=['GET', 'POST'])
def soc():
    print('hello world')
    if request.method == 'GET':
        with urllib.request.urlopen('https://www.reg.uci.edu/perl/WebSoc') as src:
            soup = bs.BeautifulSoup(src, 'lxml')
        form = str(soup.find('form', {'action':'https://www.reg.uci.edu/perl/WebSoc'}))
        form = form[:form.find('</table>')+8]
        return render_template('form.html',search_form=form)
    else:# request.method == 'POST':
        src = urllib.urlopen("https://www.reg.uci.edu/perl/WebSoc/",
                            data=urllib.parse.urlencode(request.form),
                            headers={'Content-Type': 'application/x-www-form-urlencoded'})
        soup = BeautifulSoup(src.read(), 'lxml')
        src.close()
        results = soup.find('div', {'class':'course-list'})
        # if results != None:
        #     results = unicode(results.encode(formatter='html'))
        # else:
        #     print('damn it')
        #     # We come here if course-list was not found
        #     results = unicode(soup.encode(formatter='html'))
        return render_template('results.html',results=str(results))

@app.route('/', methods=['GET', 'POST'])
def main():
        record = None
        listing = None
        on_edge=None
        if request.method == 'POST':
                code = request.form['CourseCodes']
                dept = request.form['Dept']
                num = request.form['CourseNum']
                ge = request.form['Breadth']
                if code is not '':
                        dept, num = get_course_info(code)
                        listing = gen_almanac_listing(code=code,dept=dept,num=num)
                        record = get_hist(dept,num)
                elif ge.strip() != 'ANY':
                		listing = gen_almanac_listing(ge=ge)
                elif dept.strip() is not 'ALL' and num is not '':
                        listing = gen_almanac_listing(dept=dept,num=num)
                        record = get_hist(dept,num)
                elif dept.strip() is not 'ALL' and num is '':
                        listing = gen_almanac_listing(dept=dept)
        client_agent = request.user_agent
        if client_agent.browser.strip() == 'msie' or 'Edge' in client_agent.string:
        	on_edge = 'O Yes'
        return render_template('test.html', record=record, listing=listing, on_edge=on_edge)

@app.route('/_new')
def test():
	return render_template('index1.html')

@app.route('/_test')
def new_test():
	return render_template('index.html')

@app.route('/_test/login', methods = ['POST'])
def login():
	users = mongo.db.users
	users.insert({'name' : request.form.get('username')})
	return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)
