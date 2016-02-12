'use strict'

const restify = require('restify');
const router = require('./server/router');

const server = restify.createServer();

// index
server.get('/', router.respondIndex);
server.head('/', router.respondIndex);

// metadata
server.get('/api/v1.0/meta/:translation', router.getMeta);
server.get('/api/v1.0/meta/:translation/books', router.getMeta);

// passage
server.get('/api/v1.0/:passage', router.parsePassage);
server.head('/api/v1.0/:passage', router.parsePassage);

var port = 8000;
server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});

module.exports = server;
