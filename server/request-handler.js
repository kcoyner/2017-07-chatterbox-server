/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

// const { URL } = require('url').URL;
const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

module.exports = {

  requestHandler: function(request, response) {
    // console.log('Serving request type ' + request.method + ' for url ' + request.url);
    // console.log('request.headers: ', request.headers);
    var urlParsed = url.parse(request.url);

    if (request.method === 'GET') {
      handleGetRequest(response, urlParsed);
    } else if (['POST', 'PUT', 'DELETE'].indexOf(request.method) > -1) {
      handleApiRequest(response, urlParsed, request.method);
    } else {
      response.end('Method not supported');
    }
  }
};

// TODO: in the request must find limits, search, etc

handleGetRequest = function(response, urlParsed) {
  var uri = urlParsed.pathname;
  var filename = path.join(process.cwd(), uri);


  fs.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('404 Not Found\n');
      response.end();
      return;
    }


    // const rr = fs.createReadStream(filename);
    // rr.on('readable', () => {
    //     console.log('readable:', rr.read());
    //    rr.pipe(response);
    // });
    // rr.on('end', () => {
    //     console.log('end');
    //   response.end();
    // });


    fs.readFile(filename, 'binary', function(err, file) {
      if (err) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err + '\n');
        response.end();
        return;
      }

      var resultsObj = {};
      resultsObj.results = JSON.parse(file);
      console.log('resultsObj: ', resultsObj.results[1]);

      statusCode = 200;
      headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(statusCode, headers);
      // response.write(file, 'binary');
      response.write(JSON.stringify(resultsObj));
      response.end();
    });

  });
};

handleApiRequest = function(res, urlParsed, method) {
  if (urlParsed.path !== '/classes/messages') {
    res.statusCode = 404;
    res.end('404\n');
  }
  console.log('API ONLY');
  console.log('urlParsed.path: ', urlParsed.path);
  res.end();
};

