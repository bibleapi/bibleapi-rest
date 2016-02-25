'use strict'

const mongoClient = require('mongodb').MongoClient;

const HOST = '127.0.0.1';
const PORT = '27017';
const DB_NAME = 'bibleapi';
const COLLECTION_NAME = 'bible';
const CONNECTION_STRING = HOST + ':' + PORT +'/' + DB_NAME;

// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
  connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
    process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
    process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
    process.env.OPENSHIFT_APP_NAME;
}

function open(callback) {
  mongoClient.connect('mongodb://' + CONNECTION_STRING, function(err, db) {
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

exports.open = open;
