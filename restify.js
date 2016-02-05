var restify = require('restify');
var model = require('./model');

// function respond(req, res, next) {
//   res.send('hello ' + req.params.name);
//   next();
// }
//
// function respondJson(req, res, next) {
//   res.send({ name: req.params.name, greeting: 'hello' });
//   next();
// }

function respondIndex(req, res, next) {
  res.set('Content-Type', 'text/html');
  res.end('<html>\n' +
  '  <head><title>BibleAPI</title></head>\n' +
  '  <body>Bible API web service v0.0.6</body>\n</html>');
  next();
}

function parsePassage(req, res, next) {
  model.parsePassage(req, res);
  next();
}

var server = restify.createServer();
// server.get('/hello/:name', respondJson);
// server.head('/hello/:name', respond);

server.get('/', respondIndex);
//server.head('/', respondIndex);

server.get('/:passage', parsePassage);
//server.head('/:passage', parsePassage);

server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
