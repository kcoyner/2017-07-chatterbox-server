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

var createObjectId = function() {
  var length_ = 10;
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  if (typeof length_ !== 'number') {
    length_ = Math.floor(Math.random() * chars.length_);
  }
  var str = '';
  for (var i = 0; i < length_; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};

var filterData = function(file, queryString) {
  for (let key in queryString) {
    // TODO: if objs[key] === order, then sort instead of filter and check
    // first char for presence of '-' for sort direction
    // TODO: if objs[key] === limit, then return that many objects
    // TODO: if objs[key] === username or room, then filter
    // TODO: if objs[key] === anything else, we don't care
    file = file.filter(objs => objs[key] === queryString[key]);
  }
  return file;
};

var handleGetRequest = function(request, response, pathName, queryString) {
  var filename = path.join(process.cwd(), pathName);
  fs.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      response.write('404 Not Found\n');
      response.end();
      return;
    }

    fs.readFile(filename, 'binary', function(err, file) {
      if (err) {
        response.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        response.write(err + '\n');
        response.end();
        return;
      }
      var resultsObj = {};
      resultsObj.results = JSON.parse(file);
      var finalResult = filterData(resultsObj.results, queryString);

      statusCode = 200;
      headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(statusCode, headers);
      // response.write(file, 'binary');
      response.write(JSON.stringify(finalResult));
      response.end();
    });
  });
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // The outgoing status.
  var statusCode = 200;
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = 'text/plain';

  var urlParsed = url.parse(request.url, true);
  var pathName = urlParsed.pathname;
  var queryString = urlParsed.query;
  // build path name of file messages
  var filename = path.join(process.cwd(), pathName);
  if (pathName === '/classes/messages') {
    if (request.method === 'GET') {
      handleGetRequest(request, response, pathName, queryString);

    } else if (request.method === 'POST') {
      var message = '';
      request.on('data', (chunk) => {
        var jsonDate = (new Date()).toJSON();
        message += chunk;
        message = JSON.parse(message);
        message['createdAt'] = jsonDate;
        message['updatedAt'] = jsonDate;
        message['objectId'] = createObjectId();

        response.writeHead(201, headers);

        fs.readFile(filename, function(err, messagesIn) {
          if (err) {
            return console.error(err);
          }
          messagesIn = JSON.parse(messagesIn);
          messagesIn.push((message));

          fs.writeFile(filename, JSON.stringify(messagesIn), (err) => {
            if (err) {
              return console.error(err);
            }
          });
        });

      });
      request.on('end', () => {
        response.writeHead(201, headers);
        response.end('Successfully posted!');
      });

    } else if (request.method === 'OPTIONS') {

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

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.

//module.exports = requestHandler;

module.exports = {
  requestHandler: requestHandler
};

