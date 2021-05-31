const Inventory = require('./inventory')
const Sales = require('./sales')
const mongoose = require('mongoose')

const user = new mongoose.Schema({
    type:{
        type: String
    },
    companyname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    inventory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory'
        }
    ],
    sales: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Sales'
        }
    ],
    items:{
        type: Array
    }
})

module.exports = mongoose.model('User', user)