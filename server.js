// imports
const express = require('express');
const app = express();
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');


//import config variables
const { PORT, DATABASE_URL, TEST_DATABASE_URL } = require('./config');



//use promises
mongoose.Promise = global.Promise;

//use authentication
passport.use(localStrategy);
passport.use(jwtStrategy);

//logging
app.use(morgan('common'));

//allow CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
  });


//sends a not found response for all non-existant endpoints
  app.use('*', (req, res) => {
    return res.status(404).json({ message: 'Not Found' });
  });


  let server
  // this function connects to our database, then starts the server
  function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
      //mongoose.set('debug', true);
      mongoose.connect(databaseUrl, err => {
        if (err) {
          return reject(err);
        }
        server = app.listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      });
    });
  };
  
  // this function closes the server, and returns a promise. we'll
  // use it in our integration tests later.
  function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }
  
  // if server.js is called directly (aka, with `node server.js`), this block
  // runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
  if (require.main === module) {
    runServer(TEST_DATABASE_URL).catch(err => console.error(err));
  };
  
  module.exports = { app, runServer, closeServer };