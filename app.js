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
const path = require('path')
const user = require('./models/user')
const { ESRCH } = require('constants')
const inventory = require('./models/inventory')

//Connect to DB
// mongoose.connect('mongodb+srv://Nuel:chuks@cluster0.ldv66.mongodb.net/ims?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect('mongodb://localhost/ims', {useNewUrlParser: true, useUnifiedTopology: true})


//Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
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

app.post('/signup', (req, res)=>{
    User.findOne({companyname: req.body.companyname}, async (err, company)=>{
        if(err) throw err
        if(company){
            var c = {success:false, msg:"User already exists", companyname: ''}
            res.send(c)
        } 
        if(!company){
            var salt = await bcrypt.genSaltSync(10);
            var hash = await bcrypt.hashSync(req.body.password, salt);
            const newUser = new User({
                companyname: req.body.companyname,
                password: hash,
                email: req.body.email,
                type: req.body.type
            })
            await newUser.save((err, reg)=>{
                console.log(reg._id)
                var c = {companyname:req.body.companyname, msg:"Success", success: true, id: reg._id, type: req.body.type, email: req.body.email }
                res.send(c)
            })  
        }
    })
})

app.post('/login', (req, res)=>{
    User.findOne({companyname: req.body.companyname}, (err, user)=>{
        if(err){
            var c = {
                success : false,
                message: "An unknown error occured",
            }
            res.send(c)
        }else if(!user) {
            var c = {
                success : false,
                message: "No User Found",
            }
            console.log(c)
            res.send(c)
        }else{
            password = user.password
            bcrypt.compare(req.body.password, password, (err, isMatch)=>{
                if(isMatch === true){
                    var c = {
                        success : true,
                        message: "Login Successful",
                        company: user.companyname,
                        id: user._id,
                        email: user.email,
                        type: user.type
                    }
                    res.send(c) 
                }else{
                    var c = {
                        success : false,
                        message: "Incorrect Password",
                    }
                    res.send(c)
            }
            })
        }
    })
})

app.post('/addinventory', (req, res)=>{
    var post = {
        itemName: req.body.item,
        units: req.body.units,
        description: req.body.description,
        unitPrice: req.body.unitprice
    }
    User.findById(req.body.id, function(err, user){
        Inventory.find({itemName: req.body.item}, (err, item)=>{
            if(item.length !== 0){
                var c = {
                    success : false,
                    message: "Item Already exists",
                    item: item
                }
                res.send(c)
            }else{
                Inventory.create(post, (err, inventory)=>{
                    user.inventory.push(inventory)
                    user.items.push(inventory)
                    user.save((err, save)=>{
                        var c = {
                            success : true,
                            message: "Item Successfully Created",
                            item: save
                        }
                        res.send(c)
                    })
                })
            }
        })
    })
})

app.post('/getitems', (req, res)=>{
    User.findOne({companyname: req.body.companyname}, (err, user)=>{
        var c = {
            success : true,
            message: "Data Found",
            items: user.items
        }
        res.send(c)
    })
})

app.get('/logout', (req, res)=>{
    req.logout()
    res.send(true)
})


//Start server
app.listen(process.env.PORT || 5000, ()=>{
    console.log('Api Running')
})