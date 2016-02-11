var restify = require('restify');
var parsePassage = require('./model').parsePassage;
var meta = require('./meta');

function respondIndex(req, res, next) {
  res.set('Content-Type', 'text/html');
  res.end('<html>\n' +
  '  <head><title>BibleAPI</title></head>\n' +
  '  <body>Bible API web service v0.0.7</body>\n</html>');
  next();
};

function parsePassage(req, res, next) {
  parsePassage(req, res);
  next();
};

function getMetaData(req, res, next) {
  meta.getMetaData(req, res);
  next();
};

var server = restify.createServer();

// index
server.get('/', respondIndex);
server.head('/', respondIndex);

// metadata
server.get('/api/v1.0/meta/:translation', getMetaData);
server.get('/api/v1.0/meta/:translation/books', getMetaData);

// passage
server.get('/api/v1.0/:passage', parsePassage);
server.head('/api/v1.0/:passage', parsePassage);

server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
