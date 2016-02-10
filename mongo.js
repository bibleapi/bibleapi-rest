var mongoClient = require('mongodb').MongoClient;

var DB_NAME = 'bibleapi';
var COLLECTION_NAME = 'bible';

var connection_string = '127.0.0.1:27017/' + DB_NAME;

// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

function connect(callback) {
  mongoClient.connect('mongodb://' + connection_string, function(err, db) {
    if (err) {
      console.log('Error connecting to the database: ' + err);
      throw err;
    }
    db.collection(COLLECTION_NAME, {strict:true}, function(err, collection) {
      if (err) {
        console.log('Error retrieving collection: ' + err);
        throw err;
      }
      return callback(null, collection);
    });
  });
}

exports.connect = connect;
