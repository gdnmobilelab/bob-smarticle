var express = require('express');
var app = express();

app.get('/', (req, res) => {
  res.send('HEY!')
});

app.listen(3000, () => console.log('Server running on port 3000'))