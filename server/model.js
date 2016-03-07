'use strict'

const _ = require('lodash');
const mongo = require('./mongo');
const fetcher = require('./fetcher');
const error = require('./error');

var bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

function reformatResults(items, hasMultipleTranslations) {
  let result = {
    verses: items
  };

  if (!hasMultipleTranslations) {
    let text = [];
    _(items).forEach(function(item) {
      text.push(item.text);
    });

    result.text = text.join(' ');
  }

  return result;
}

function displayResults(res, mongoQuery, hasMultipleTranslations) {
  if (mongoQuery.length > 0) {
    mongo.open(function(err, collection) {
      collection.find({ $or: mongoQuery }, { _id: 0 })
        .sort({chapter: 1, verse: 1})
        .toArray(function(err, items) {
          res.charSet('utf-8');
          if(items.length > 0) {
            res.send(reformatResults(items, hasMultipleTranslations));
          }
          else {
            res.send(error.onError('Bible passage is not found.'));
          }
        });
    });
  }
  else {
    res.send(error.onError('Bible passage is not found.'));
  }
}

exports.parsePassage = function(req, res) {
  let entities = bcv.parse(req.params.passage).entities;
  if (entities.length < 1) {
    res.send(error.onError('Passage not found.'));
  }

  _(entities).each(function(entity) {
    // passage contains whole book
    if (entity.type === 'b') {
      res.send(error.onError('Please specify passage chapter.'));
    }
    // whole chapter or verse
    else if (entity.type === 'bc' || entity.type === 'bcv') {
      // bcv has only one passage
      const translations = entity.passages[0].translations ? entity.passages[0].translations : [];
      fetcher.fetchBcv(entity.passages[0], entity.type, function(err, result) {
        let hasMultipleTranslations = false;
        if (entity.type === 'bcv' && translations > 1) {
          hasMultipleTranslations = true;
        }
        displayResults(res, result, hasMultipleTranslations);
      });
    } // range of verses
    else if (entity.type === 'range') {
      // range has only one passage
      fetcher.fetchRange(entity.passages[0], function(err, result) {
        displayResults(res, result, false);
      });
    } // sequence of passages
    else if(entity.type === 'sequence') {
      _(entity.passages).each(function(passage) {
        // passage sequence includes bcv
        if (passage.type === 'bcv' || passage.type === 'integer') {
          fetcher.fetchBcv(passage, 'bcv', function(err, result) {
            displayResults(res, result, false);
          });
        } // passage sequence includes range
        else if(passage.type === 'range') {
          fetcher.fetchRange(passage, function(err, result) {
            displayResults(res, result, false);
          });
        }
      });
    }
  });
};
