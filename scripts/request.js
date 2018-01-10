var cleanParams = require('./request/params.js');
var rate = require('./request/rate.js');
var clean = require('./request/clean.js');
var cap = require('./request/cap.js');
var groups = require('./request/groups.js');
var seen = require('./request/seen.js');
var notified = require('./request/notified.js');
var fetch = require('./fetch.js');

var fs = require('fs-extra');
var express = require('express');
var app = express();

app.get('/', (req, res) => {
    if (Object.keys(req.query).length == 0) {
        res.send('No arguments provided');
    } else {
        var params = cleanParams(req.query);

        var data = params.debug ? fetch(params.id, params.debug) : fs.readJsonSync('./.data/smarticles/' + params.id + '.json');
            data = notified(data, params.notified);
            data = seen(data, params);
            data = rate(data, params);
            data = clean(data);
            data = params.debug ? data : cap(data);
            data = groups(data, params);

        res.setHeader('Content-Type', 'application/json');
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(JSON.stringify(data));
    }
});

app.listen(3000, () => console.log('Server running on port 3000'))
