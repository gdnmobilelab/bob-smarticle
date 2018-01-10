var fs = require('fs-extra');
var gsjson = require('google-spreadsheet-to-json');
var deasync = require('deasync');

var structure = require('./fetch/structure.js');
var validate = require('./fetch/validate.js');
var manipulate = require('./fetch/manipulate.js');

var keys = require('../keys.json');

var isDone = false,
    data;

function fetchData(id, callback) {
    gsjson({
        spreadsheetId: id,
        allWorksheets: true,
        credentials: keys
    })
    .then(function(result) {
        callback(result, id);
    })
    .then(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function updateOldData(data, id) {
    data.lastFetched = new Date();

    if (!fs.existsSync('./.data')) {
        fs.mkdirSync('./.data');
    }

    if (!fs.existsSync('./.data/smarticles')) {
        fs.mkdirSync('./.data/smarticles');
    }

    fs.writeJsonSync('./.data/smarticles/' + id + '.json', data);
}

module.exports = function(id, debug = false) {
    isDone = false;

    fetchData(id, function(spreadsheet, id) {
        console.log('Fetching data...');

        data = structure(spreadsheet, id);
        data = validate(data);
        data = manipulate(data);

        if (!debug) {
            updateOldData(data, id);
        }

        isDone = true;

        console.log('Updated ' + data.furniture.title);

        return data;
    });

    deasync.loopWhile(function() {
        return !isDone;
    });

    return data;
}
