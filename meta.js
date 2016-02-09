var bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

exports.getMetaData = function(req, res) {
  var meta = bcv.translation_info(req.params.query);

  res.charSet('utf-8');
  res.send({meta: meta});
};
