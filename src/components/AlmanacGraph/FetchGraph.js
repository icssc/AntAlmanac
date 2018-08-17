let url_base = "http://summer18.herokuapp.com/";

// AJAX
//@param callback is a function to pass the url after ready state avaliable
 export function getGraph(quarter,year,code,callback)
{
  var graph_url = url_base + quarter+'/' + year + '/' + code;
  // code for IE7+, Firefox, Chrome, Opera, Safari
  //"https://summer18.herokuapp.com/w/18/36050"
    let  xmlhttp= new XMLHttpRequest();
    xmlhttp.open("GET",graph_url, true );
    xmlhttp.onreadystatechange = () =>
     {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
      {
          let imgSrc = xmlhttp.responseText;
          let regex = /<embed*(.*?)>/g;
          let arr, outp = [];
          while ((arr = regex.exec(imgSrc))) 
              outp.push(arr[1]);
          let str = outp.toString();
          str = str.split(" ");
          callback(str[4]);
      }
  };
  xmlhttp.send();    
}



/*
export function getGraph(callBack)
{
 //let graphUrl = url_base + q + "/" + y + "/" + code
  request('https://summer18.herokuapp.com/w/18/36050', function(err, resp, html) 
  {
        if (!err)
        {
          const $ = cheerio.load(html);
          let graph = $('#cheerio');
          console.log("The Graph from CHerrio",graph.html());
          callBack(graph);
        }
  });
}
*/
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
 */