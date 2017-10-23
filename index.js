var getData = require('./scripts/data.js');

var express = require('express');
var app = express();

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(getData()));
});

app.listen(3000, () => console.log('Server running on port 3000'))
