'use strict';

//require packages
const mongoose = require('mongoose');


const companySchema = mongoose.Schema({
    location: {type: String, required: true},
    name: {type: String, required: true},
    companyID: {type: String, required: true},
});


companySchema.methods.serialize = function() {
    return {
            location: this.location,
            name:this.name,
            companyID:this.companyID
    }
};

const Company = mongoose.model('Company', companySchema);

module.exports = {Company};