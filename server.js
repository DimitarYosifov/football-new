const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));
app.set('port', process.env.PORT || 8080);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const firebase = require("firebase/app");
require('firebase/auth');
require('firebase/database');
app.use(bodyParser.json());

const config_firebase = {
  apiKey: 'AIzaSyB6CoLU9BDQyk998IlqyIY7cVwSR-fvsSw',
  authDomain: 'football-d4256.firebaseapp.com',
  databaseURL: 'football-d4256.firebaseio.com',
  storageBucket: 'football-d4256.appspot.com'
};

const server = app.listen(app.get('port'), function () {
  console.log('listening on port ', server.address().port);
});

firebase.initializeApp(config_firebase);

app.get('/test', function (req, res, next) {
  console.log(33333);
  res.send('APIworks- connected to github');
});

