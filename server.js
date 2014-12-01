var express = require('express');
var wines = require('./model');

var app = express();

app.get('/api/employees/:id/reports', wines.findByManager);
app.get('/api/employees/:id', wines.findById);
app.get('/api/employees', wines.findAll);

app.listen(3000);

console.log('Listening on port 3000...');
