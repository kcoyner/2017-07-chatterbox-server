/**
 * server/request-handler.js
 */

const fs = require('fs');
const path = require('path');
const url = require('url');
const FILENAME = path.join(process.cwd(), 'server/classes/messages');
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
      // TODO: sort by date by examining createdAt
      file = file;
    } else if (key === 'limit') {
      file = file.slice(0, queryString[key]);
    }
  }
  return file;
};

var return404 = function(response) {
  response.writeHead(404, {
    'Content-Type': 'text/plain'
  });
  response.end('404 Not Found\n');
};

var return500 = function(response, err) {
  console.error('FILENAME not found: ', err + '\n');
  response.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  response.end('Error: File not found. StatusCode 500');
};

var handleGetRequest = function(request, response) {
  if (url.parse(request.url).pathname !== '/classes/messages') {
    return404(response);
  } else {
    var queryString = url.parse(request.url, true).query;

    fs.readFile(FILENAME, 'binary', function(err, file) {
      if (err) {
        return500(response, err);
        return;
      }
      var resultsObj = {};
      resultsObj.results = JSON.parse(file);
      var finalResult = {};
      finalResult.results = filterData(resultsObj.results, queryString);
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(200, headers);
      response.end(JSON.stringify(finalResult));
    });
  }
};

var handleOptionsRequest = function(request, response) {
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'text/plain';
  response.writeHead(200, headers);
  response.end();
};

var handlePostRequest = function(request, response) {
  if (url.parse(request.url).pathname !== '/classes/messages') {
    return404(response);
  } else {
    var message = '';
    request.on('data', function(chunk) {
      message += chunk;
      console.log('message: ', message);
    }).on('end', function() {
      message = JSON.parse(message || 'null');  // TODO: this is a problem
      if (!message) {
        console.log('help');
      }
      fs.readFile(FILENAME, function(err, messagesIn) {
        if (err) {
          return500(response, err);
          return;
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

        fs.writeFile(FILENAME, JSON.stringify(messagesIn), function(err) {
          if (err) {
            console.error(err);
          }
          console.log('Done! File written.');
        });
      });

    // }).on('end', function() {

      var headers = defaultCorsHeaders;
      headers['Content-Type'] = 'application/json';
      response.writeHead(201, headers);
      response.end(() => console.log('POST complete'));
    });
  }
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  const { headers, method, url } = request;

  if (method === 'OPTIONS') {
    handleOptionsRequest(request, response);
  } else if (method === 'GET') {
    handleGetRequest(request, response);
  } else if (method === 'POST') {
    handlePostRequest(request, response);
  } else {
    if (request.url === '/') {
      request.url = '/client/index.html';
    }
  }
};

module.exports = {
  requestHandler: requestHandler
};

