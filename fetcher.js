'use strict'

const bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
const bcv = new bcv_parser;

exports.fetchBcv = function fetchBcv(passage, type, callback) {
  let mongoQuery = [];
  let translations = [];
  if (passage.translations != null) {
    for (let i=0; i<passage.translations.length; i++) {
      translations.push(passage.translations[i].osis);
    }
  } // no translations set
  else {
    translations.push('RUSV'); // default
  }
  if (type === 'b') {
    mongoQuery.push({
      'tran':translations[0],
      'bookRef':passage.start.b
    });
  }
  else if (type === 'bc') {
    mongoQuery.push({
      'tran':translations[0],
      'bookRef':passage.start.b,
      'chapter':passage.start.c
    });
  }
  else if (type === 'bcv') {
    for (let i=0; i<translations.length; i++) {
      mongoQuery.push({
        'tran':translations[i],
        'bookRef':passage.start.b,
        'chapter':passage.start.c,
        'verse':passage.start.v
      });
    }
  }
  return callback(null, mongoQuery);
};

exports.fetchRange = function fetchRange(passage, callback) {
  var mongoQuery = [];
  var translationInfo = bcv.translation_info("");

  var pTranslation = 'RUSV';
  if (passage.translations != null) {
    pTranslation = passage.translations[0].osis;
  }

  // passage of the same book
  if (passage.start.b === passage.end.b) {
    // passage of one chapter
    if (passage.start.c === passage.end.c) {
      mongoQuery.push({
        'tran':pTranslation,
        'bookRef':passage.start.b,
        'chapter':passage.start.c,
        'verse':{$gte:passage.start.v, $lte:passage.end.v}
      });
    }
    else { // passage of many chapters
      var chapters = [];
      for (var ch=passage.start.c; ch<=passage.end.c; ch++) {
        var startVerse = 1;
        var endVerse = translationInfo.chapters[passage.start.b][ch-1];

        if (ch === passage.start.c) {
          startVerse = passage.start.v;
        }
        if (ch === passage.end.c) {
          endVerse = passage.end.v;
        }

        chapters.push({
          'tran':pTranslation,
          'bookRef':passage.start.b,
          'chapter':ch,
          'verse':{$gte:startVerse, $lte:endVerse}
        });
      }

      mongoQuery.push({
        $or: chapters
      });
    }
  } // passage of many books
  else {
    var chapters = [];
    var startBook = translationInfo.order[passage.start.b];
    var endBook = translationInfo.order[passage.end.b];

    for (var b=startBook; b<=endBook; b++) {
      var bookRef = translationInfo.books[b-1];

      // passage includes the whole book in the middle
      if (b != startBook && b != endBook) {
        chapters.push({
          'tran':pTranslation,
          'bookRef':bookRef
        });
      }
      else { // other half-books parts
        var startChapter = 1;
        var endChapter = translationInfo.chapters[bookRef].length;

        if (b === startBook) {
          startChapter = passage.start.c;
        }
        if (b === endBook) {
          endChapter = passage.end.c;
        }

        for (var ch=startChapter; ch<=endChapter; ch++) {
          var startVerse = 1;
          var endVerse = translationInfo.chapters[bookRef][ch-1];

          // first chapter, first verse in range
          if (b === startBook && ch === startChapter) {
            startVerse = passage.start.v;
            chapters.push({
              'tran':pTranslation,
              'bookRef':bookRef,
              'chapter':startChapter,
              'verse':{$gte:startVerse, $lte:endVerse}
            });
          } // last chapter, last verse in range
          else if (b === endBook && ch === endChapter) {
            endVerse = passage.end.v;
            chapters.push({
              'tran':pTranslation,
              'bookRef':bookRef,
              'chapter':ch,
              'verse':{$gte:startVerse, $lte:endVerse}
            });
          }
          else { // other whole chapters in range
            chapters.push({
              'tran':pTranslation,
              'bookRef':bookRef,
              'chapter':ch
            });
          }
        }
      }
    }

    mongoQuery.push({
      $or: chapters
    });
  }
  return callback(null, mongoQuery);
};
