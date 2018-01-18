from flask import Flask, render_template, url_for, request
import time
from datetime import datetime, date, timedelta
import pygal
from pygal.style import DefaultStyle
import urllib.request, html
import bs4 as bs
import os
from urllib.parse import urlparse
import redis

app = Flask(__name__)

def wkday_trans(day):
    if day == 0:
        return 'M'
    if day == 1:
        return 'T'
    if day == 2:
        return 'W'
    if day == 3:
        return 'T'
    if day == 4:
        return 'F'
    if day == 5:
        return 'S'
    if day == 6:
        return 'S'
    return 'Wtf'

def get_rela_dates(abs_dates):
    result = []
    weeks = ['8','9','10','f','b1','b2','b3','1','2']
    wk_ind = 0
    day = 0
    for i in range(abs_dates):
        result.append('{}{}'.format(weeks[wk_ind],wkday_trans(day)))
        day += 1
        if day == 7:
            day = 0
            wk_ind +=1
        if i == 25:
        	day = 0
        	wk_ind += 1
    return result

def mkgraph(code,dept,num, f=False):
	url = urlparse(os.environ.get('REDISCLOUD_URL'))
	r = redis.Redis(host=url.hostname, port=url.port, password=url.password, decode_responses=True)

	response = r.get(code)
    
	if response == None:
		chart = pygal.Line(no_data_text='Course Not Found',
			   style=DefaultStyle(no_data_font_size=40))
		chart.add('line', [])
		return chart.render_data_uri()
    
	cap_rec,enr_rec,req_rec,wl_rec = response
	num_rec = len(enr_rec)
        
	line_chart = pygal.Line(title='Registration History for {} ({}   {})'.format(code,html.unescape(dept),num),x_title='Time (By the End of the Day)', y_title='Number of People')
	line_chart.x_labels = map(str, get_rela_dates(num_rec))

	line_chart.add('Maximum', cap_rec)
	line_chart.add('Enrolled', enr_rec)
	line_chart.add('Requested', req_rec)
	if typeof(wl_rec) is list:
		line_chart.add('Waitlisted', wl_rec)
	
    return line_chart.render_data_uri()

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

def uri_encode(string):
    if '&' in string:
        string = string[:string.find('&')]+'&#38;'+string[string.find('&')+1:]
    if ' ' in string:
        string = string[:string.find(' ')]+'&nbsp;'+string[string.find(' ')+1:]
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
					res.append((r,mkgraph(code,dept,cur_num),dept,cur_num))
					r = ''
			elif row.find('td', {'class':'CourseTitle'}) != None:
				temp = str(row.find('td', {'class':'CourseTitle'}))
				temp = temp[temp.find('>')+1:]
				temp = temp[:temp.find('<')].split()
				cur_num = temp[-1]
				if dept != ' '.join(temp[:-1]):
					dept = ' '.join(temp[:-1])
	return res

@app.route('/_course_hist', methods=['GET','POST'])
def _course_hist():
	record = None
	if request.method == 'POST':
		dept = request.form['dept']
		num = request.form['num']
		record=get_hist(dept,num)
	return render_template('course_hist.html',record=record)

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

if __name__ == '__main__':
    app.run(debug=True)
