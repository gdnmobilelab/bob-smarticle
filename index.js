var cleanParams = require('./scripts/params.js');
var rate = require('./scripts/rate.js');
var clean = require('./scripts/clean.js');
var cap = require('./scripts/cap.js');
var groups = require('./scripts/groups.js');
var seen = require('./scripts/seen.js');
var fetch = require('./scripts/fetch.js');

var fs = require('fs-extra');
var express = require('express');
var app = express();

app.get('/', (req, res) => {
    if (Object.keys(req.query).length == 0) {
        res.send('No arguments provided');
    } else {
        var params = cleanParams(req.query);

        var data = params.debug ? fetch(params.id) : fs.readJsonSync('./.data/smarticles/' + params.id + '.json');
            data = seen(data, params);
            data = rate(data, params);
            data = clean(data);
            data = cap(data);
            data = groups(data, params);

        res.setHeader('Content-Type', 'application/json');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(JSON.stringify(data));
    }
});

app.listen(3000, () => console.log('Server running on port 3000'))
