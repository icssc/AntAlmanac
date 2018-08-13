const https = require('https');
const request = require('request');
const cheerio = require('cheerio');

let url_base = "http://summer18.herokuapp.com/";

export function getGraph(callBack)
{
 //let graphUrl = url_base + q + "/" + y + "/" + code
  request('https://summer18.herokuapp.com/w/18/36050', function(err, resp, html) 
  {
        if (!err)
        {
          const $ = cheerio.load(html);
          let graph = $('#cheerio').attr('src');
          callBack(graph);
        }
  });
}

//var url_base = "https://www.ics.uci.edu/~rang1/";
/* OLD CODE
 export function getGraph(quarter, year, code)
{
  var graph_url = url_base + quarter+'/' + year + '/' + code;
  console.log(graph_url);
  https.get('',(resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
      console.log("Chunk: " + data);
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(data);
      return JSON.parse(data).explanation;
    });

  }).on("error", (err) => {
    console.log("Error: " + err.name +"THE MESSAGE "+ err.message);
  });
}
 
/*
 AJAX
 export function getGraph(quarter, year, code)
{
  var graph_url = url_base + quarter+'/' + year + '/' + code;
  
  // code for IE7+, Firefox, Chrome, Opera, Safari
    let  xmlhttp= new XMLHttpRequest();
  xmlhttp.onreadystatechange = function()
  {
    console.log(xmlhttp)
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
          let imgSrc = xmlhttp.responseText;
          console.log(imgSrc)
      }
      console.log(xmlhttp)
  }
  xmlhttp.open("GET", graph_url, true );
  xmlhttp.send();    
}
*/
