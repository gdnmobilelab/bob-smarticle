var getData = require('./scripts/data.js');
var filter = require('./scripts/filter.js');
var clean = require('./scripts/clean.js');

var express = require('express');
var app = express();

app.get('/', (req, res) => {
    if (Object.keys(req.query).length == 0) {
        res.send('No arguments provided');
    } else {
        var data = getData(req.query.id);
            data = filter(data, req.query);
            data = clean(data);

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(data));
    }
});

app.listen(3000, () => console.log('Server running on port 3000'))
