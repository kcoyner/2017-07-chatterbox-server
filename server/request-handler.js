/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
const path = require('path');
var url = require('url');
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // The outgoing status.
  var statusCode = 200;
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = 'text/plain';

  var urlParsed = url.parse(request.url);
  var pathName = urlParsed.pathname;
  var queryString = urlParsed.query;
  console.log(queryString);
  if (pathName === '/classes/messages') {
    if (request.method === 'GET') {
       handleGetRequest(request,response,pathName);

    } else if (request.method ==='POST') {
      var body = "";
      request.on('data', function(chunk){
        body += chunk;
        response.writeHead(201, headers);
      })
      request.on('end', function () {
        response.writeHead(201, headers);
        response.end('Successfully posted!');
      })

    }
    else if (request.method === 'OPTIONS') {

    } else if (request.url) {
      if (request.url === '/') {
        request.url = '/client/index.html';
      }
    }
  } else {
    response.writeHead(404, headers);
    response.end('could not query request');
  }

};

function handleGetRequest(request,response,pathName) {
  var filename = path.join(process.cwd(), pathName);
  console.log('filename-hey: ', filename);

  fs.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('404 Not Found\n');
      response.end();
      return;
    }

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
}

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.


module.exports = requestHandler;

