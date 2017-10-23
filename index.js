var getData = require('./scripts/data.js');

var express = require('express');
var app = express();

app.get('/', (req, res) => {
    if (Object.keys(req.query).length == 0) {
        res.send('No arguments provided');
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(getData(req.query.id)));
    }
});

app.listen(3000, () => console.log('Server running on port 3000'))
