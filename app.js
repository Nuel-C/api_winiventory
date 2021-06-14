const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const bodyParser = require('body-parser')
const User = require('./models/user')
const moment = require('moment')
const Inventory = require('./models/inventory')
const Sales = require('./models/sales')
const Purchase = require('./models/purchase')
const path = require('path')
const user = require('./models/user')
const { ESRCH } = require('constants')
const inventory = require('./models/inventory')

//Connect to DB
// mongoose.connect('mongodb+srv://Nuel:chuks@cluster0.ldv66.mongodb.net/ims?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})


//Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(cookieParser('secret'))
app.use(passport.initialize())
app.use(passport.session())
require('./passportConfig')(passport)
app.use(express.static(path.join(__dirname, 'build')))

//Routes

app.post('/signup', (req, res) => {
    User.findOne({ companyname: req.body.companyname }, async (err, company) => {
        if (err) throw err
        if (company) {
            var c = { success: false, msg: "User already exists", companyname: '' }
            res.send(c)
        }
        if (!company) {
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(req.body.password, salt);
            const newUser = new User({
                companyname: req.body.companyname,
                password: hash,
                email: req.body.email,
                type: req.body.type
            })
            await newUser.save((err, reg) => {
                console.log(reg._id)
                var c = { companyname: req.body.companyname, msg: "Success", success: true, id: reg._id, type: req.body.type, email: req.body.email }
                res.send(c)
            })
        }
    })
})

app.post('/login', (req, res) => {
    User.findOne({ companyname: req.body.companyname }, (err, user) => {
        if (err) {
            var c = {
                success: false,
                message: "An unknown error occured",
            }
            res.send(c)
        } else if (!user) {
            var c = {
                success: false,
                message: "No User Found",
            }
            console.log(c)
            res.send(c)
        } else {
            password = user.password
            bcrypt.compare(req.body.password, password, (err, isMatch) => {
                if (isMatch === true) {
                    var c = {
                        success: true,
                        message: "Login Successful",
                        company: user.companyname,
                        id: user._id,
                        email: user.email,
                        type: user.type
                    }
                    res.send(c)
                } else {
                    var c = {
                        success: false,
                        message: "Incorrect Password",
                    }
                    res.send(c)
                }
            })
        }
    })
})

app.post('/addinventory', (req, res) => {
    var post = {
        itemName: req.body.itemName,
        units: req.body.units,
        description: req.body.description,
        unitPrice: req.body.unitPrice,
        companyName: req.body.companyname
    }
    User.findById(req.body.id, function (err, user) {
        Inventory.find({ companyName: req.body.companyname, itemName: req.body.itemName }, (err, inventory) => {
            if (err) {
                var c = {
                    success: false,
                    message: "Oops an error occured!",
                    err
                }
                res.send(c)
            }
            if (inventory.length !== 0) {
                var c = {
                    success: false,
                    message: "Item Already exists",
                    item: inventory
                }
                res.send(c)
            } else {
                Inventory.create(post, (err, inventory) => {
                    if (err) {
                        res.json({
                            message: err
                        })
                    } else {
                        var c = {
                            success: true,
                            message: "Item Successfully Created",
                            item: inventory
                        }
                        res.send(c)
                    }
                })
            }
        })
    })
})

app.post('/edit_inventory/:id', (req, res) => {
    let units
    Inventory.findOne({ companyName: req.body.companyname, itemName: req.params.id }, (err, inventory) => {
        if (err) {
            res.send(err)
        } else {
            
            units = inventory.units - req.body.units
            req.body.units = units

            Inventory.findOneAndUpdate({ companyName: req.body.companyname, itemName: req.params.id }, req.body, (err, inventory) => {
                if (err) {
                    res.send(err)
                } else {
                    res.status(200).json({
                        message: 'Success!',
                        data: inventory
                    })
                }
            })
        }
    })
})

app.post('/edit_inventory/:id/edit', (req, res) => {
    console.log(req.body)
    Inventory.findOneAndUpdate({ companyName: req.body.companyname, itemName: req.params.id }, req.body, (err, inventory) => {
        if (err) {
            res.send(err)
        } else {
            res.status(200).json({
                message: 'Success!',
                data: inventory
            })
        }
    })
})

app.delete('/delete_inventory/:id', (req, res) => {
    console.log(req.params.id)
    
    Inventory.findOneAndRemove({ companyName: req.body.companyname, itemName: req.params.id }, (err) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.status(200).json({
                message: 'Deleted!'
            })
        }
    })
})

app.post('/getitems', (req, res) => {
    Inventory.find({ companyName: req.body.companyname }, (err, inventory) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Data Found",
                items: inventory
            })
        }
    })
})

app.get('/list_inventories', (req, res) => {
    Inventory.find({}, (err, inventory) => {
        if (err) {
            res.json({
                message: err
            })
        } else {
            res.status(200).json({
                success: true,
                message: "Data Found",
                items: inventory
            })
        }
    })
})

app.post('/add_sale/:id', (req, res) => {
    req.body.companyname = req.params.id
    Sales.create(req.body, (err, sale) => {
        if (err) {
            res.json({
                message: 'Opps an error occured!',
                err
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                sale
            })
        }
    })
})

app.get('/list_sales/:id', (req, res) => {
    Sales.find({companyname: req.params.id}, (err, sales) => {
        if (err) {
            res.json({
                message: 'Oops, an error occured!'
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                sales
            })
        }
    })
})

app.post('/add_purchase', (req, res) => {
    console.log(req.body.companyName)
    Purchase.create(req.body, (err, purchase) => {
        if (err) {
            res.json({
                message: 'Opps an error occured!',
                err
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                purchase
            })
        }
    })
})

app.post('/edit_purchase/:id', (req, res) => {
    Purchase.findOneAndUpdate({ customerName: req.params.id, status: 'Not yet approved' }, { $set: { status: 'Approved' } }, (err, purchase) => {
        if (err) {
            res.json({
                message: 'Oops, an error occured!',
                err
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                purchase
            })
        }
    })
})

app.get('/list_purchases/:id', (req, res) => {
    Purchase.find({customerName: req.params.id}, (err, purchases) => {
        if (err) {
            res.json({
                message: 'Oops, an error occured!'
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                purchases
            })
        }
    })
})

//Get all the purchases for a specific company
app.post('/list_purchases', (req, res) => {
    Purchase.find({companyName: req.body.companyname}, (err, purchases) => {
        if (err) {
            res.json({
                message: 'Oops, an error occured!'
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                purchases
            })
        }
    })
})

app.get('/list_users', (req, res) => {
    User.find({type: 'Seller'}, (err, users) => {
        if (err) {
            res.json({
                message: 'Oops, an error occured!',
                err
            })
        } else {
            res.status(200).json({
                message: 'Success!',
                users
            })
        }
    })
})

app.get('/logout', (req, res) => {
    req.logout()
    res.send(true)
})

app.get('*', (req, res) => {
    res.redirect('/')
})

//Start server
app.listen(process.env.PORT || 5000, () => {
    console.log('Api Running')
})