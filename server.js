'use strict'

const restify = require('restify');
const model = require('./server/model');
const meta = require('./server/meta');

const server = restify.createServer();

function respondIndex(req, res, next) {
  res.set('Content-Type', 'text/html');
  res.send('<html>\n' +
    '<head><title>BibleAPI</title></head>\n' +
    '<body>Bible API web service v0.0.9</body>\n</html>');
  next();
};

function parsePassage(req, res, next) {
  model.parsePassage(req, res);
  next();
};

function getMeta(req, res, next) {
  meta.getMeta(req, res);
  next();
};

// index
server.get('/', respondIndex);
server.head('/', respondIndex);

// metadata
server.get('/api/v1.0/meta/:translation', getMeta);
server.get('/api/v1.0/meta/:translation/books', getMeta);

// passage
server.get('/api/v1.0/:passage', parsePassage);
server.head('/api/v1.0/:passage', parsePassage);

var port = 8000;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

module.exports = server;
