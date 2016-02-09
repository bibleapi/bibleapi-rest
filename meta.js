var bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

exports.getMeta = function(req, res) {
  var translation = bcv.translation_info(req.params.translation);

  res.charSet('utf-8');
  res.send({translation: translation});
};

exports.getMetaBooks = function(req, res) {
  var translation = bcv.translation_info(req.params.translation);

  res.charSet('utf-8');
  res.send({translation: translation.books});
};
