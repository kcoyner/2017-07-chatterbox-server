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
  for (var key in queryString) {
    if (key === 'username' || key === 'roomname') {
      file = file.filter(objs => objs[key] === queryString[key]);
    } else if (key === 'order') {
      // sort by date
    } else if (key === 'limit') {
      file = file.slice(0, queryString[key]);
    }
  }
  return file;
};

var handleGetRequest = function(request, response, pathName, queryString) {
  // console.log('pathName: ', pathName);
  var filename = path.join(process.cwd(), 'server' + pathName);
  // console.log('PWD: ', process.env.PWD)
  fs.exists(filename, function(exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      // response.write('404 Not Found\n');
      response.end('404 Not Found\n');
      return;
    }

    fs.readFile(filename, 'binary', function(err, file) {
      if (err) {
        response.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        // response.write(err + '\n');
        response.end(err + '\n');
        return;
      }
      var resultsObj = {};
      resultsObj.results = JSON.parse(file);
      var finalResult = {};
      finalResult.results = filterData(resultsObj.results, queryString);
      // statusCode = 200;
      headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(200, headers);
      response.end(JSON.stringify(finalResult));
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
  // var filename = path.join(process.cwd(), pathName);
  var filename = path.join(process.cwd(), 'server' + pathName);
  // if (pathName === '/classes/messages') {

  if (request.method === 'OPTIONS') {
    response.writeHead(200, headers);
    response.end();
  } else if (request.method === 'GET') {
    handleGetRequest(request, response, pathName, queryString);

  } else if (request.method === 'POST') {
    var message = '';
    request.on('data', function(chunk) {
      message += chunk;
      message = JSON.parse(message);
      response.writeHead(201, headers);

      fs.readFile(filename, function(err, messagesIn) {
        if (err) {
          console.error(err);
        }

        messagesIn = JSON.parse(messagesIn);
        // add createdAt and updatedAt keys
        var jsonDate = (new Date()).toJSON();
        if (!message.createdAt) {
          message.createdAt = jsonDate;
        }
        if (!message.updatedAt) {
          message.updatedAt = jsonDate;
        }
        // default room name
        if (!message.roomname) {
          message.roomname = 'Lobby';
        }
        //create objectId
        message.objectId = createObjectId();
        messagesIn.push(message);

        fs.writeFile(filename, JSON.stringify(messagesIn), function(err) {
          if (err) {
            console.error(err);
          }
          console.log('Done! File written.');
        });
      });

    });
    request.on('end', function() {
      response.writeHead(201, headers);
      // response.end('Successfully posted!');
      response.end();
    });

  } else if (request.url) {
    if (request.url === '/') {
      request.url = '/client/index.html';
    }
  }
  // } //else {
  // response.writeHead(404, headers);
  // response.end('could not query request');
  // }
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

module.exports = {
  requestHandler: requestHandler
};
