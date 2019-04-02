'use strict';

//require packages
const mongoose = require('mongoose');
const CsvBuilder = require('csv-builder');

const User = require('../users/model')


const ItemSchema = mongoose.Schema({
    location: {type: String, required: true},
    area: {type: String, required: true},
    quantity: {type: Number, required: true},
    shape: {type: String, required: true},
    size: {type:String},
    feet: {type: Number},
    inches: {type:Number},
    fraction: {type:Number},
    grade: {type:String},
    reserve: {type:String},
    po: {type:String},
    remarks: {type:String},
    companyID:{type: String},
    created:{type: Date, default: Date.now},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    //company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company'},
    lastEdit: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

ItemSchema.pre('find', function(next) {
    this.populate('user');
    this.populate('lastEdit');
    next();
  });

ItemSchema.methods.serialize = function() {
    return {
        id:this.id,
        location: this.location,
        area: this.area,
        quantity: this.quantity,
        shape: this.shape,
        size: this.size,
        feet: this.feet,
        inches: this.inches,
        fraction: this.fraction,
        grade: this.grade,
        po:this.po,
        created:this.created,
        remarks: this.remarks,
        reserve: this.reserve,
        user: this.user.serialize(),
        lastEdit:this.lastEdit.serialize()
    }
};

const builder = new CsvBuilder({
    headers: ['shape', 'size', 'remarks', 'quantity', 'location', 'area', 'feet', 'inches', 'fraction', 'grade', 'po', 'reserve'],
  })



const Item = mongoose.model('Item', ItemSchema);

module.exports = {builder, Item};