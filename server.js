var express = require('express');
var wines = require('./model');

var app = express();

app.get('/:passage', wines.findAll);

app.listen(3005);

console.log('Listening on port 3005...');

//wines.findAll("Gen 1:1");
