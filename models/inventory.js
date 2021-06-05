const mongoose = require('mongoose')
const inventory = new mongoose.Schema({
    itemName: {
        type: String
    },
    units: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    unitPrice: {
        type: Number,  
    },
    description: {
        type: String
    },
    unitsSold: {
        type: Number
    },
    amountSold: {
        type: Number
    },
    companyName: {
        type: String
    }
})

module.exports = mongoose.model('Inventory', inventory)