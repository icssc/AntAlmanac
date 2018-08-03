const https = require('https');
var url_base = "https://www.ics.uci.edu/~rang1/";

function FetchGraph(quarter, year, code){
  var graph_url = url_base + quarter + year + '/' + code + '.txt';
  https.get(graph_url, (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      return JSON.parse(data).explanation;
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
