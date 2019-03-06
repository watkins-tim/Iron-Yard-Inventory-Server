'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const router = express.Router();
const jsonParser = bodyParser.json();

const {Item} = require('./model');
const {User} = require('../users/model');
const {Company} = require('../company/');
const { localStrategy, jwtStrategy } = require('../auth/strategies');


passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });




module.exports = {router};