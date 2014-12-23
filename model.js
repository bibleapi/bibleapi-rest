var bcv_parser = require("./full_bcv_parser.js").bcv_parser;
var bcv = new bcv_parser;

//var db;
var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient;

/*var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("bible-api");
    db.collection('bible', {strict:true}, function(err, collection) {
        if (err) {
            console.log("Error!");
        }
    });
});*/

var collection;
var connection_string = '127.0.0.1:27017/bibleapi';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

MongoClient.connect('mongodb://' + connection_string, function(err, db) {
  if(err) throw err;
  db.collection('bible', {strict:true}, function(err, collect) {
    collection = collect;
    if (err) {
      console.log("Error!");
    }
  });
});

var mongoQuery = [];

var fetchBcv = function(passage, type) {
  var translations = [];
  if (passage.translations != null) {
    for (var i=0; i<passage.translations.length; i++) {
      translations.push(passage.translations[i].osis);
    }
  } // no translations set
  else {
    translations.push('RST'); // default
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

exports.parsePassage = function(req, res) {
  mongoQuery = [];
  var entities = bcv.parse(req.params.passage).entities;

  for (var i=0; i<entities.length; i++) {
    var entity = entities[i];
    // passage contains whole book, whole chapter or verse also
    if (entity.type === 'b' || entity.type === 'bc' || entity.type === 'bcv') {
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
    //db.collection('bible', function(err, collection) {
      collection.find({
        $or: mongoQuery
      }, { _id: 0 })
      .toArray(function(err, items) {
        res.jsonp(items);
      });
    //});
  }
  else {
    var error = {
      message: 'Bible passage is not found.'
    };
    res.jsonp(error);
  }
};
