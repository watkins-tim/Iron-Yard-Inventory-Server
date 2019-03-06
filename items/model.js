'use strict';

//require packages
const mongoose = require('mongoose');


const ItemSchema = mongoose.Schema({
    location: {type: String, required: true},
    area: {type: String, required: true},
    quantity: {type: String, required: true},
    shape: {type: String, required: true},
    size: {type:String, required: true},
    feet: {type:String, required: true},
    inches: {type:String, required: true},
    fraction: {type:String, required: true},
    grade: {type:String, required: true},
    reserve: {type:String, required: true},
    remarks: {type:String, required: true},
    company: {type:String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    lastEdit: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

ItemSchema.pre('find', function(next) {
    this.populate('author');
    this.populate('company');
    next();
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

const Item = mongoose.model('Item', ItemSchema);

module.exports = {Item};