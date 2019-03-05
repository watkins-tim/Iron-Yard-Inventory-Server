'use strict';

//require packages
const mongoose = require('mongoose');


const companySchema = mongoose.Schema({
    location: {type: String, required: true},
    Name: {type: String, required: true},
    companyID: {type: String, required: true},
});


ItemSchema.methods.serialize = function() {
    return {
            location: this.location,
            area: this.area,
            quantity: this.quantity,
            shape: this.shape,
            size: this.size,
            feet: this.feet,
            inches: this.inches,
            fraction: this.fraction,
            grade: this.grade,
            reserve: this.reserve,
            remarks: this.remarks,
            reserve: this.reserve,
            author: this.author
    }
};
ItemSchema.pre('find', function(next) {
    this.populate('author');
    next();
  });

const Item = mongoose.model('User', ItemSchema);

module.exports = {User};