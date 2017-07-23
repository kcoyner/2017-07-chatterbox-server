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


handleGetRequest = function(res, urlParsed) {
  console.log('urlParsed.path: ', urlParsed.path);
  if (urlParsed.path === '/classes/messages' || urlParsed.path === '/.favicon.ico' || urlParsed.path === '/') {

    var testObj = {
      results: []
    };
    statusCode = 200;
    headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    res.writeHead(statusCode, headers);
    res.write(JSON.stringify(testObj) + '\n');
    res.end();

  } else {
    res.statusCode = 404;
    res.end('404\n');


  }
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

