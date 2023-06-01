const express = require('express');
const ejs = require('ejs');
const users = require('./models/users1');
const products = require('./models/products1');
const bodyParser =require('body-parser')
const { check, validationResult } = require('express-validator');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const fileUpload = require('express-fileupload');
const app = express();
const port = 4000;
const urlencodedParser =bodyParser.urlencoded({extended: false})
const mongoose = require('mongoose')
const  ObjectID = require('mongodb').ObjectId;
const path = require('path');
const dburi = 'mongodb+srv://nour_hesham:Nour11062003@cluster0.1kyqmes.mongodb.net/cluster0?retryWrites=true&w=majority'
app.use(fileUpload());
app.use(express.static('public'));
app.use(session(
  { secret: 'Your_Secret_Key' })
  )
  app.use('/js', express.static(__dirname + 'public/javascript'))
app.use('/imgs', express.static(__dirname + 'public/imgs'))
app.use('/uploads', express.static(__dirname + 'public/imgs/uploads'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(dburi,).then(result => 
  app.listen(port, () => 
  console.info(`listening on port ${port}`)))
  .catch(err => console.log(err))

  app.set('views', './views')
app.set('view engine', 'ejs')
app.get('/loginForm',(req, res) => {

    res.render('loginForm', { user: (req.session.user === undefined ? "" : req.session.user) })
  });
app.get('', (req, res) => {

    res.render('index', { user: (req.session.user === undefined ? "" : req.session.user) })
  })
  app.get('/index', (req, res) => {
    res.render('index', { user: (req.session.user === undefined ? "" : req.session.user) })
  })
  app.get('/RegisterationForm', (req, res) => {
    res.render('RegisterationForm', { user: (req.session.user === undefined ? "" : req.session.user) })
  })
  app.get('/addproducts', (req, res) => {
    res.render('addproducts', { user: (req.session.user === undefined ? "" : req.session.user) })
  })
  app.get('/admindashboard', (req, res) => {
    if (req.session.user !== undefined && req.session.user.Type === 'admin') {
      users.find()
        .then(result => {
          res.render('admindashboard', { users: result, user: (req.session.user === undefined ? "" : req.session.user) });
        })
        .catch(err => {
          console.log(err);
        });
    }
    else {
      res.send('you are not admin');
    }
  });
  app.post('/RegisterationForm-action', urlencodedParser, [
    check('Firstname', 'Firstname should contain min 3 characters')
      .exists()
      .isLength({ min: 3 }),
    check('Lastname', 'Lastname should contain min 3 characters')
      .exists()
      .isLength({ min: 3 }),
    check('email')
      .exists().withMessage('Email is required')
      .isEmail().withMessage('Invalid email'),
    check('password')
      .exists().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password should contain at least 6 characters')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/)
      .withMessage('Password should contain at least one letter, one number, and one special character'),
  ], (req, res) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const alert = errors.array();
      res.render('RegisterationForm', {
        alert,
        emailError: errors.array().find(error => error.param === 'email') || null,
      });
    } else {
      const email = req.body.email;
      users.isThisEmailInUse(email)
        .then(inUse => {
          if (inUse) {
            // Email is not in use, proceed with registration
            res.render('RegisterationForm', { emailError: '', alert: [] });
          } else {
            // Email is already in use
            res.render('RegisterationForm', { emailError: 'Email already taken', alert: [] });
          }
        })
        .catch(error => {
          console.log('Error checking email:', error);
          res.render('RegisterationForm', { emailError: 'An error occurred', alert: [] });
        });
        const add = new users({
            Firstname: req.body.Firstname,
            Lastname:req.body.Lastname,
            Email:req.body.email,
            Password: req.body.password,
            Type:req.body.type
          })
          add.save()
            .then((result) => {
              console.log('registration successful!')
             
            })
    }
  });
  app.post('/login-action', (req, res) => {
    var query = { Email:req.body.email, Password: req.body.password };
    users.find(query)
      .then(result => {
        if (result.length > 0) {
          console.log(result[0]);
          req.session.user = result[0];
          res.render('myprofile', { userP: result[0], user: (req.session.user === undefined ? "" : req.session.user) });

        }
        else {
          res.send('invalid data')
        }
      })
      .catch(err => {
        console.log(err);
      });
  });
  ////////////////////////////
 app.post('/addproducts-action',(req, res) => {
    let imgFile1;
    let uploadPath1;
  
    console.log(req.files);
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    imgFile1 = req.files.image1;
   
  
    uploadPath1 = __dirname+ '/public/imgs/uploads/' + req.body.name + '_1' + path.extname(imgFile1.name);
    
  
    imgFile1.mv(uploadPath1, function (err) {
      if (err)
        return res.status(500).send(err);
    });
  
    
    const price = parseFloat(req.body.price);
  
    
    const prod = new products({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
     
      image1: req.body.name + '_1' + path.extname(imgFile1.name),
      
    });
  
    prod.save()
    .then(result => {
      res.render('addproducts', { successMessage: 'Product added successfully.' });
    })
    .catch(err => {
      console.log(err);
     
    });
  });
  app.post('/deleteproducts-action/:prodId',async (req, res) => {
    try {
     products.deleteOne({ _id: new ObjectID(req.params.prodId)}).then(result =>{
      res.redirect('/');
     })
    } catch (err) {
      console.log(err);
    }
  });
  app.get('/editproducts/:prodId',(req,res)=>{
    products.findById(req.params.prodId).then(function (prod){
      res.render('editproducts',{product:prod});
    })
  });
  app.post('/editproducts/:prodId',(req, res) => {
    const prodId = req.params.prodId;
  
    // Retrieve the updated product data from the request body
    const updatedProduct = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
     
    };
  
    // Update the product in the database
    products.findByIdAndUpdate(prodId, updatedProduct, { new: true })
      .then((updatedProd) => {
        res.render('editproducts', { product: updatedProd, successMessage: 'Product updated successfully.' });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
  });
  //////////////////
 app.get('/products', function (req, res, next) {
    products.find().then(function (product) {
      res.render('products', {
              productsList: product, userP: req.session.user, user: (req.session.user === undefined ? "" : req.session.user)
            })
    });
  });
  module.exports={app};