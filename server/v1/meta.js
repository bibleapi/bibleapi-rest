const bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
const bcv = new bcv_parser;

exports.getMeta = function(req, res) {
  var translation = bcv.translation_info(req.params.translation);
  res.send({translation: translation});
};

exports.getMetaBooks = function(req, res) {
  var translation = bcv.translation_info(req.params.translation);
  res.send({translation: translation.books});
};
