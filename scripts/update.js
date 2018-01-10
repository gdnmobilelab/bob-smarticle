// shell script to pass in an id to fetch
var fetch = require('../scripts/fetch.js');

fetch(process.argv.slice(2)[0]);
