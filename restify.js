var restify = require('restify');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

function respondJson(req, res, next) {
  res.send({ name: req.params.name });
  next();
}

var server = restify.createServer();
server.get('/hello/:name', respondJson);
//server.head('/hello/:name', respond);

server.listen(8000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
