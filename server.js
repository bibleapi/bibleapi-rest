var express = require('express');
var model = require('./model');

var app = express();

app.get('/:passage', model.parsePassage);

app.listen(3005);

console.log('Listening on port 3005...');
