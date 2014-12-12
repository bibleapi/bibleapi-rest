var bcv_parser = require("./ru_bcv_parser.js").bcv_parser;
var bcv = new bcv_parser;

var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    db;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("bible-api");
    db.collection('bible', {strict:true}, function(err, collection) {
        if (err) {
            console.log("Error!");
        }
    });
});

exports.findAll = function(req, res) {
  var parsedObj = bcv.parse(req.params.passage);
  var book = parsedObj.entities[0].passages[0].start.b;
  var chapter = parsedObj.entities[0].passages[0].start.c;
  var verse_s = parsedObj.entities[0].passages[0].start.v;
  var verse_e = parsedObj.entities[0].passages[0].end.v;

  if (book === 'Gen') { book = 1; }
  if (book === 'Lev') { book = 2; }

  db.collection('bible', function(err, collection) {
    collection.find({'book':book, 'chapter':chapter,
         'verse':{$gte:verse_s, $lte:verse_e}})
         .sort({verse:1}).toArray(function(err, items) {
      res.jsonp(items);
    });
  });
};

exports.findById = function(req, res) {
    console.log(req.params);
    var id = parseInt(req.params.id);
    console.log('findById: ' + id);
    db.collection('employees', function(err, collection) {
        collection.findOne({'id': id}, function(err, item) {
            console.log(item);
            res.jsonp(item);
        });
    });
};

exports.findByManager = function(req, res) {
    var id = parseInt(req.params.id);
    console.log('findByManager: ' + id);
    db.collection('employees', function(err, collection) {
        collection.find({'managerId': id}).toArray(function(err, items) {
            console.log(items);
            res.jsonp(items);
        });
    });
};
