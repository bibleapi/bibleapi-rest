const meta = require('./meta');
const model = require('./model');

exports.respondIndex = function respondIndex(req, res, next) {
  res.set('Content-Type', 'text/html');
  res.end('<html>\n' +
    '<head><title>BibleAPI</title></head>\n' +
    '<body>Bible API web service v0.0.9</body>\n</html>');
  next();
};

exports.parsePassage = function parsePassage(req, res, next) {
  model.parsePassage(req, res);
  next();
};

exports.getMeta = function getMeta(req, res, next) {
  meta.getMeta(req, res);
  next();
};
