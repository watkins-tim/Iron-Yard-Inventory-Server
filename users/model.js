'use strict';

//require packages
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


const UserSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    password: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    companyID: {type:String, required: true},
    //company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},

});

UserSchema.methods.serialize = function() {
    return {
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        companyID: this.companyID,
        company: this.company
    }
};

UserSchema.pre('find', function(next){
    this.populate('company');
    next();
});

UserSchema.pre('findOne', function(next){
    this.populate('company');
    next();
});

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };
  
  UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
  };

const User = mongoose.model('User', UserSchema);

module.exports = {User};