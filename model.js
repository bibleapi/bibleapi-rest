var bcv_parser = require("./en_bcv_parser.js").bcv_parser;
var bcv = new bcv_parser;

var db;
var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("bible-api");
    db.collection('bible', {strict:true}, function(err, collection) {
        if (err) {
            console.log("Error!");
        }
    });
});

var mongoQuery = [];

var fetchBc = function(passage) {
  var pTranslation = 'RST';

  if (passage.translations != null) {
    pTranslation = passage.translations[0].osis;
  }

  mongoQuery.push({
    'tran':pTranslation,
    'bookRef':passage.start.b,
    'chapter':passage.start.c
  });
}

var fetchBcv = function(passage) {
  var pTranslation = 'RST';
  // display passage for each translation
  if (passage.translations != null) {
    for (var i=0; i<passage.translations.length; i++) {
      mongoQuery.push({
        'tran':passage.translations[i].osis,
        'bookRef':passage.start.b,
        'chapter':passage.start.c,
        'verse':passage.start.v
      });
    }
  } // one translation only
  else {
    mongoQuery.push({
      'tran':pTranslation,
      'bookRef':passage.start.b,
      'chapter':passage.start.c,
      'verse':passage.start.v
    });
  }
};

var fetchRange = function(passage) {
  var translationInfo = bcv.translation_info("");

  var pTranslation = 'RST';
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

exports.findAll = function(req, res) {
  mongoQuery = [];
  var entities = bcv.parse(req.params.passage).entities;

  for (var i=0; i<entities.length; i++) {
    var entity = entities[i];
    // only one chapter
    if (entity.type === 'bc') {
      // bc has only one passage
      fetchBc(entity.passages[0]);
    } // only one verse
    if (entity.type === 'bcv') {
      // bcv has only one passage
      fetchBcv(entity.passages[0]);
    } // range of verses
    else if (entity.type === 'range') {
      // range has only one passage
      fetchRange(entity.passages[0]);
    }
    else if(entity.type === 'sequence') {
      for (var j=0; j<entity.passages.length; j++) {
        var passage = entity.passages[j];
        // passage sequence includes bcv
        if (passage.type === 'bcv' || passage.type === 'integer') {
          fetchBcv(passage);
        } // passage sequence includes range
        else if(passage.type === 'range') {
          fetchRange(passage);
        }
      }
    }
  }

  db.collection('bible', function(err, collection) {
    collection.find({
      $or: mongoQuery
    }).toArray(function(err, items) {
      res.jsonp(items);
    });
  });
};
