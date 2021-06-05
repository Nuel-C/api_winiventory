const mongoose = require('mongoose')

const sale = new mongoose.Schema({
    item: {
        type: String
    },
    units: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    customer: {
        type: String,  
    },
    total: {
        type: Number
    },
    phone: {
        type: String
    },
    discount: {
        type: Number
    }
})

module.exports = mongoose.model('Sales', sale)