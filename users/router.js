'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const router = express.Router();
const jsonParser = bodyParser.json();

const {User} = require('./model');
const {Company} = require('../company');

const { localStrategy, jwtStrategy } = require('../auth/strategies');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'username', 'password', 'companyID'];
    const missingField = requiredFields.find(field => !(field in req.body));
    //console.log(req.body);
    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField
      });
    }
    
    const stringFields = ['username', 'password', 'firstName', 'lastName', 'companyID'];
    const nonStringField = stringFields.find(
      field => field in req.body && typeof req.body[field] !== 'string'
    );
  
    if (nonStringField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Incorrect field type: expected string',
        location: nonStringField
      });
    }
    let {username, password, firstName, lastName, companyID} = req.body;
    // Username and password come in pre-trimmed, otherwise we throw an error
    // before this
    const activities = {};
    firstName = firstName.trim();
    lastName = lastName.trim();
    username = username.trim();

   return User.find({username})
      .countDocuments()
      .then(count => {
        if (count > 0) {
          // There is an existing user with the same username
          return Promise.reject({
            code: 422,
            reason: 'ValidationError',
            message: 'username already taken',
            location: 'username'
          });
        }
        return Company.findOne({companyID})
      })
      .then(company=>{
        //console.log(company);
        if (!company){
          return Promise.reject({
            code:422,
            reason: 'ValidationError',
            message: 'Company ID does not exist',
            location: 'companyID'
          });
        }
          return User.hashPassword(password);
      })
      .then(hash => {
        return User.create({
          username,
          password: hash,
          firstName,
          lastName,
          companyID
        });
      })
      .then(user => {
        //console.log(user);
        return res.status(201).json(user.serialize());
      })
      .catch(err => {
        // Forward validation errors on to the client, otherwise give a 500
        // error because something unexpected has happened
        if (err.reason === 'ValidationError') {
          return res.status(err.code).json(err);
        }
        //debugging
        //console.log(err);
        res.status(500).json({code: 500, message: 'Internal server error'});
      });
    });

router.get('/', jwtAuth, jsonParser, (req, res)=>{
    return User.findOne({"username": req.user.username})
    .then(user=>{
      return res.status(200).json(user.serialize());
    })
    .catch(err=>{
      //console.log(err);
      return res.status(500).json({code: 500, message: 'Internal server error'});
    })
});

router.delete('/',jwtAuth,(req,res)=>{
  //console.log('username'+ req.user.username)
  return User.deleteOne({username:req.user.username})
    .then(next=>{
      res.status(200).json(next);
    })
    .catch(err=>{
      //console.log(err);
      return res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = {router};