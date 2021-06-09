const mongoose = require('mongoose')

const purchase = new mongoose.Schema({
    itemName: {
        type: String
    },
    units: {
        type: Number
    },
    unitPrice: {
        type: Number
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    companyName: {
        type: String
    },
    customerName: {
        type: String
    },
    status: {
        type: String
    }
})

module.exports = mongoose.model('Purchase', purchase)