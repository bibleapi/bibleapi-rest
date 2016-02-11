var mongo = require('./mongo');
var fetcher = require('./fetcher');

var bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

var mongoQuery = [];

function reformatResults(items) {
  var text = [];
  items.forEach(function(item) {
    text.push(item.text);
  });
  return {
    verses: items,
    text: text.join(' ')
  };
}

exports.parsePassage = function(req, res) {
  mongoQuery = [];
  var passage = req.params.passage;
  var entities = bcv.parse(passage).entities;

  for (var i=0; i<entities.length; i++) {
    var entity = entities[i];
    // passage contains whole book
    if (entity.type === 'b') {
      res.send({message: 'Please specify at least passage chapter.'});
    }
    // whole chapter or verse
    else if (entity.type === 'bc' || entity.type === 'bcv') {
      // bcv has only one passage
      fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
        mongoQuery = result;
      });
    } // range of verses
    else if (entity.type === 'range') {
      // range has only one passage
      fetcher.fetchRange(bcv, entity.passages[0], function(err, result) {
        mongoQuery = result;
      });
    } // sequence of passages
    else if(entity.type === 'sequence') {
      for (var j=0; j<entity.passages.length; j++) {
        var passage = entity.passages[j];
        // passage sequence includes bcv
        if (passage.type === 'bcv' || passage.type === 'integer') {
          fetcher.fetchBcv(passage, 'bcv', function(err, result) {
            mongoQuery = result;
          });
        } // passage sequence includes range
        else if(passage.type === 'range') {
          fetcher.fetchRange(bcv, passage, function(err, result) {
            mongoQuery = result;
          });
        }
      }
    }
  }

  if (mongoQuery.length > 0) {
    mongo.open(function(err, collection) {
      collection.find({ $or: mongoQuery }, { _id: 0 })
        .sort({chapter: 1, verse: 1})
        .toArray(function(err, items) {
          res.charSet('utf-8');
          res.send(reformatResults(items));
        });
    });
  }
  else {
    res.send({ error: 'Bible passage is not found.' });
  }
};
