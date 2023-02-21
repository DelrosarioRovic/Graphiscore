//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// cookies and session
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const passport = require('passport');
const buffer = require('buffer');

const fs = require('fs');
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/userDB',{ useNewUrlParser: true});

// register user db
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
  displayName:String
});

// product collections-------
const productSchema = new mongoose.Schema({
  productName: String,
  productImage: Buffer
});
const Product = mongoose.model("Product", productSchema);

const g1 = new Product({
  productName: "GTX-1660",
  productImage: fs.readFileSync('public/imgs/My project.png')
});
// const geo = new Product({
//   productName: "RTX 2060"
// })
// geo.save();
// g1.save();
// *-------------------------
userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
})
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//relation between user and product
const reviewSchema = new mongoose.Schema({
  review: String,
  user: userSchema,
  product: productSchema
});
const Review = mongoose.model("Review", reviewSchema);

app.use(express.json());
app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.padala = "iflogin";
    res.locals.displayName = req.user.displayName;
  } else {
    res.locals.padala = "ifnotlogin";
  }
  next();
});
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
} 
function checkIfNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  next();
}

app.get("/", function(req, res) {
 res.render("home");
});

app.get('/review', checkIfNotAuthenticated,function(req, res) {
  res.render('review', { productName: '' });
});

app.get("/graphiscore", function(req, res) {
  res.render("graphiscore");
});

app.get("/login", checkAuthenticated, function(req, res) {
  res.render("login");
});

app.get("/register", checkAuthenticated, function(req, res) {
  res.render("register");
});




app.post("/register", function(req, res) {
  User.register({username: req.body.username, displayName: req.body.display_name}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");  
    } else {
        passport.authenticate("local")(req, res, function() {
          req.session.padala = "iflogin";
          req.session.displayName = req.user.displayName;
          res.redirect("/");
        });
    }
  });
});
app.post("/login", function(req, res) {
  const user = new User ({
    username: req.body.username,
    password: req.body.password
});

req.login(user, function(err) {
    if (err) {
        console.log(err);
    } else {
        passport.authenticate("local", { failureRedirect: '/login' })(req, res, function() {
          req.session.padala = "iflogin";
          req.session.displayName = req.user.displayName;
          res.redirect("/");
        });
    }
});
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while logging out.');
      }
      req.session.destroy(function (err) {
          res.redirect("/");
        });
    });
});

// app.get('/search', (req, res) => {
//   const searchTerm = req.query.q;

//   Product.find({ productName: { $regex: searchTerm, $options: 'i' } }, (err, products) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.send(products);
//     }
//   });
// });
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  let query = {};
  if (searchTerm !== '') {
    query.productName = { $regex: searchTerm, $options: 'i' };
  }
  Product.find(query, (err, products) => {
    if (err) {
      console.log(err);
    } else {
      res.send(products);
    }
  });
});

app.get('/allproducts', (req, res) => {
  Product.find({}, (err, products) => {
    if (err) {
      console.log(err);
    } else {
      res.send(products);
    }
  });
});

app.post('/fetchingproduct', (req, res) => {
  const productId = req.body.productId;
  Product.findById(productId, function(err, foundProduct) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    } else {
      if (foundProduct) {
        // console.log(foundProduct);
        const product = {
          productName: foundProduct.productName,
          productImage: foundProduct.productImage.toString('base64')
        };
        res.json({ productName: product });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    }
  });
});

app.post("/review", async (req, res) => {
  const productName= req.body.search_product_review;
  const productReview = req.body.review_product;
 Product.findOne({productName: productName}, function(err, foundProduct) {
    const newReview = new Review({
      review: productReview,
      user: req.user,
      product: foundProduct
    });
    newReview.save();
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
