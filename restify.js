'use strict'

const restify = require('restify');
const model = require('./model');
const meta = require('./meta');
const server = restify.createServer();

function respondIndex(req, res, next) {
  res.set('Content-Type', 'text/html');
  res.end('<html>\n' +
  '  <head><title>BibleAPI</title></head>\n' +
  '  <body>Bible API web service v0.0.8</body>\n</html>');
  next();
};

function parsePassage(req, res, next) {
  model.parsePassage(req, res);
  next();
};

function getMetaData(req, res, next) {
  meta.getMetaData(req, res);
  next();
};

// index
server.get('/', respondIndex);
server.head('/', respondIndex);

// metadata
server.get('/api/v1.0/meta/:translation', getMetaData);
server.get('/api/v1.0/meta/:translation/books', getMetaData);

// passage
server.get('/api/v1.0/:passage', parsePassage);
server.head('/api/v1.0/:passage', parsePassage);

var port = 8000;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

module.exports = server;
