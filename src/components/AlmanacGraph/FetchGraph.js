let url_base = "https://summer18.herokuapp.com/";

// AJAX
//@param callback is a function to pass the url after ready state avaliable
 export  function getGraph(quarter,year,code,callback)
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
        /* This code to pasre the text response and extract the src from it 
        currently we are passing the the text to  UITab
          let regex = /<embed*(.*?)>/g;
          let arr, outp = [];
          while ((arr = regex.exec(imgSrc))) 
              outp.push(arr[1]);
          let str = outp.toString();
          str = str.split(" ");
         */
          callback(imgSrc);
      }
  };
  xmlhttp.send();    
}
