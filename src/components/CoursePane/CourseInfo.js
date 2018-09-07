var request = require('request');
var cheerio = require('cheerio');

let courseArr = [];
let urlArr = [];
var url = '';
var dept = ''	// how to get this
var course = '';	// and this?

// scrapes each dept's url, and saves in urlArr with its dept title
request('http://catalogue.uci.edu/allcourses/', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    $('h2.letternav-head').next().find('a').each(function(i, element){
		var a = $(element);
		var title = a.text();
		url = a.attr('href');
		var courseUrl = {
			title:title,
			url:url
		}
		urlArr.push(courseUrl);
    });

    // searches for the dept's url, and sets it to the var url
	for(var j=0; j<urlArr.length; j++) {
		if (urlArr[j].title.includes(dept)) {
			url = 'http://catalogue.uci.edu' + urlArr[j].url;
		}
	}
  }
});

// uses the url given by previous scrape and gives the course info
request(url, function (error, response, html) {
	// gets all courses (title and description) and saves in courseArr
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html);
		$('p.courseblocktitle').each(function(i, element){
			var a = $(element).children();
			var title = a.text();
			var desc = a.parent().nextAll().text();
			var courseInfo = {
				title: title,
				desc: desc,
			};
			courseArr.push(courseInfo);

		// searches courseArr to find correct title
		});
		for(var j=0; j<courseArr.length; j++) {
			if (courseArr[j].title.includes(course)) {
				// outputs to the popup when user hovers
			}
		}
	}

});