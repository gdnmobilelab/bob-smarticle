var fetch = require('./fetch.js');

var cleanParams = require('./request/params.js');
var notified = require('./request/notified.js');
var seen = require('./request/seen.js');
var rate = require('./request/rate.js');
var clean = require('./request/clean.js');
var cap = require('./request/cap.js');
var groups = require('./request/groups.js');
var reintroduction = require('./request/reintroduction.js');
var additionalProperties = require('./request/additionalProperties.js');
var onboarding = require('./request/onboarding.js');

var fs = require('fs-extra');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.post('/', (req, res) => {
    var params = req.body;

    var data = params.debug ? fetch(params.id, params.debug) : fs.readJsonSync('./.data/smarticles/' + params.id + '.json');
        params = params.preview ? data.preview[params.preview] : params;
        params = cleanParams(params);
        data = notified(data, params.notified);
        data = seen(data, params);
        data = rate(data, params);
        data = clean(data);
        data = params.debug ? data : cap(data);
        data = groups(data, params);
        data = reintroduction(data, params);
        data = additionalProperties(data);
        data = onboarding(data, params);

    res.setHeader('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send(JSON.stringify(data));
});

app.get('/', (req,res) => {
    res.send('Error: POST requests only');
});

app.listen(3000, () => console.log('Server running on port 3000'))
