var mongo = require('./mongo');
//var bcv_parser = require("./full_bcv_parser.js").bcv_parser;
var bcv_parser = require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

var mongoQuery = [];

function fetchBcv(passage, type) {
  var translations = [];
  if (passage.translations != null) {
    for (var i=0; i<passage.translations.length; i++) {
      translations.push(passage.translations[i].osis);
    }
  } // no translations set
  else {
    translations.push('RUSV'); // default
  }

  //console.log(translations);

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
    for (var i=0; i<translations.length; i++) {
      mongoQuery.push({
        'tran':translations[i],
        'bookRef':passage.start.b,
        'chapter':passage.start.c,
        'verse':passage.start.v
      });
    }
  }
};

function fetchRange(passage) {
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
};

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
      fetchBcv(entity.passages[0], entity.type);
    } // range of verses
    else if (entity.type === 'range') {
      // range has only one passage
      fetchRange(entity.passages[0]);
    } // sequence of passages
    else if(entity.type === 'sequence') {
      for (var j=0; j<entity.passages.length; j++) {
        var passage = entity.passages[j];
        // passage sequence includes bcv
        if (passage.type === 'bcv' || passage.type === 'integer') {
          fetchBcv(passage, 'bcv');
        } // passage sequence includes range
        else if(passage.type === 'range') {
          fetchRange(passage);
        }
      }
    }
  }

  if (mongoQuery.length > 0) {
    mongo.connect(function(err, collection) {
      collection.find({ $or: mongoQuery }, { _id: 0 })
        .sort({chapter: 1, verse: 1})
        .toArray(function(err, items) {
          res.charSet('utf-8');
          res.send(reformatResults(items));
        });
    });
  }
  else {
    var error = {
      message: 'Bible passage is not found.'
    };
    res.send(error);
  }
};
