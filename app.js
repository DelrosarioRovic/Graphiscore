//jshint esversion:6
//addingthis
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// cookies and session
const passportLocalMongoose = require('passport-local-mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const fs = require('fs');
const { validateHeaderName } = require("http");
const toastr = require("toastr");
const app = express();

const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


const store = new MongoStore({
  mongooseConnection: mongoose.connection
});
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    secure: false, 
    httpOnly: true, 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://Akocrovic123:Akocrovic123@mydb.jfyc7mf.mongodb.net/userDB',{ useNewUrlParser: true});
// mongoose.connect('mongodb://127.0.0.1:27017/userDB',{ useNewUrlParser: true});

// register user db
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  displayName:String,
  bio:String,
  profilePicture: Buffer,
  profilePicUrl: String
});

// product collections-------
const productSchema = new mongoose.Schema({
  productName: String,
  productDscrp: String,
  productImgUrl: String
});
const Product = mongoose.model("Product", productSchema);


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
  rate: {
    type: Number,
    required: [true, 'Please Leave a Rating!'],
    message: 'Please Leave a Rating!'
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
});

const Review = mongoose.model("Review", reviewSchema);


app.use(express.json());
app.use(flash());
app.use(function(req, res, next) {
  if (req.isAuthenticated()) {
    console.log("User authenticated successfully:", req.user);
    res.locals.padala = "iflogin";
    res.locals.displayName = req.user.displayName;
    res.locals.profilePicUrl = req.user.profilePicUrl;
    console.log('User is authenticated'+req.user);
  } else {
    console.log('User is not authenticated');
    res.locals.padala = "ifnotlogin";
  }
  next();
}, function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
} 
function checkIfNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please Log In to Access This Page!");
    return res.redirect('/login');
  }
  next();
}

//search
app.get('/search_bar', (req, res) => {
  const displayName = req.query.displayName;
  if (!displayName) {
    return res.status(400).send('Missing search term');
  }

  // Search for users by displayName using the User model
  User.find({ displayName: { $regex: new RegExp(displayName, 'i') } })
    .then(users => {

      res.json(users);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Error searching for users');
    });
});

app.get("/", function(req, res) {
  Review.aggregate([
  {
    $group: {
      _id: "$product",
      count: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
      average: { $avg: "$rate" },
      users: { $addToSet: "$user" }
    }
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product"
    }
  },
  {
    $unwind: "$product"
  },
    {
      $project: {
        _id: "$product._id",
        productName: "$product.productName",
        productDscrp: "$product.productDscrp",
        productImgUrl: "$product.productImgUrl",
        average: 1,
        totalReviews: { $sum: "$count" },
        ratings: { $size: "$users" }
      }
    },
  {
    $sort: { ratings: -1, count: -1 }
  },
  {
    $limit: 5
  }
])
.exec(function (err, results) {
  if (err) {
    // res.render("home");
  } else {
    results.forEach(function(product) {
      if (product.average) {
        product.average = parseFloat(product.average.toFixed(1));
      }
    });

    if (req.session.successfulLogin) {
      req.session.successfulLogin = false; // Reset flag
      var successMessage = "You have successfully logged in!";
    }
    res.render('home', { mostRated: results, successMessage: successMessage });
  }
});
});

app.get('/review-count', async function(req, res) {
  const productId = req.query.id;
  
  const result = await Review.aggregate([
  { $match: { 'product': mongoose.Types.ObjectId(productId) } },
  {
    $group: {
      _id: '$user',
      hasReview: { $sum: { $cond: [{ $ne: ['$review', ''] }, 1, 0] } },
      hasRating: { $sum: { $cond: [{ $ne: ['$rate', ''] }, 1, 0] } },
      avgRating: { $avg: '$rate' },
    }
  },
  {
    $group: {
      _id: null,
      reviewCount: { $sum: '$hasReview' },
      rateCount: { $sum: '$hasRating' },
      avgRating: { $avg: '$avgRating' },
    }
  }
  ]).exec();

  if (result[0] && result[0].avgRating) {
    result[0].avgRating = parseFloat(result[0].avgRating.toFixed(1));
  }

  const resultObj = result[0] || { reviewCount: 0, rateCount: 0, avgRating: 0 };
  res.json(resultObj);

});

app.get('/review', checkIfNotAuthenticated, function(req, res) {
  productPrev = [{
    productName: "",
    totalReviews: "",
    ratings: "",
    average: "",
    productImgUrl: ""
  }]
  const errors = req.flash("error") || [];
  res.render('review' ,{productPrev: productPrev, errors});
});


app.get("/products", async function(req, res) {
  try {
    const products = await Product.find();
    const productsWithRating = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const reviews = await Review.find({ product: product._id });

      let totalRating = 0;
      let totalReview = 0;
      let numReviews = 0;

      for (let j = 0; j < reviews.length; j++) {
        const review = reviews[j];
        if (review.rate && review.rate !== "") {
          totalRating += parseInt(review.rate);
          numReviews++;
        }
        if (review.review && review.review !== "") {
          totalReview++;
        }
      }

      let averageRating = numReviews > 0 ? totalRating / numReviews : 0;

      productsWithRating.push({
        _id: product._id,
        productName: product.productName,
        productDscrp: product.productDscrp,
        numReviews: numReviews,
        averageRating: averageRating.toFixed(1),
        totalReview: totalReview,
        productImgUrl: product.productImgUrl
      });
    }
    res.json(productsWithRating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/graphiscore", function(req, res) {
  res.render("graphiscore");
});


app.get("/login", checkAuthenticated, function(req, res) {
  const errors = req.flash().error || [];
  res.render("login", { errors });
});

app.get("/register", checkAuthenticated, function(req, res) {
  const errors = req.flash("error") || [];
  res.render("register", { errors });
});

app.post("/register", function(req, res) {
  User.findOne({username: req.body.username}, function(err, user) {
    if (user) {
      req.flash("error", "Email Already Exists!");
      res.redirect("/register");
    } else {
      User.register({username: req.body.username, displayName: req.body.display_name}, req.body.password, function(err, user) {
        if (err) {
          console.log(err);
          req.flash("error", err.message);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function() {
            console.log("User authenticated successfully:", req.user);
            req.session.padala = "iflogin";
            req.session.displayName = req.user.displayName;
            req.session.profilePicUrl = req.user.profilePicUrl;
            res.redirect("/");
          });
        }
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
        passport.authenticate("local", { failureFlash:true ,failureRedirect: '/login', })(req, res, function() {
          req.session.successfulLogin = true;
          req.session.padala = "iflogin";
          req.session.displayName = req.user.displayName;
          req.session.profilePicUrl = req.user.profilePicUrl;
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
      res.sendStatus(500);
    } else {
      res.send(products);
    }
  });
});

app.post("/review", async (req, res) => {
  const productName= req.body.search_product_review;
  const productReview = req.body.review_product;
  const rateStar = req.body.rate;

  const foundProduct = await Product.findOne({ productName: productName });
  
  if (foundProduct) {
    const existingReview = await Review.findOne({
      user: req.user,
      product: foundProduct,
    });
    
    if (existingReview) {
      existingReview.review = productReview;
      existingReview.rate = rateStar;

      existingReview.save(function (err) {
        if (err) {
          const message = err.message.split(':')[2].trim();
          req.flash("error", message);
          res.redirect(req.headers.referer || "/review");
        } else {
          req.flash("success", "Review Updated!");
          res.redirect("/graphiscore/"+foundProduct._id);
        }
      });
    }
    else {
      const newReview = new Review({
        review: productReview,
        rate: rateStar,
        user: req.user,
        product: foundProduct
      });
  
      newReview.save(function (err) {
        if (err) {
          const message = err.message.split(':')[2].trim();
          req.flash("error", message);
          res.redirect(req.headers.referer || "/review");
        } else {
          req.flash("success", "New Review Added!");
          res.redirect("/graphiscore/"+foundProduct._id);
        }
      });
    }
  } else {
    req.flash("error", "Please Select a GPU!");
    res.redirect("/review");
  }
});

app.get("/graphiscore/:_id", function(req, res){
  let getUrl = req.params._id;

  Product.aggregate()
    .match({ _id: mongoose.Types.ObjectId(getUrl) })
    .lookup({
      from: "reviews",
      let: { productId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$product", "$$productId"] }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userObj"
          }
        },
        {
          $unwind: "$userObj"
        },
        {
          $project: {
            _id: "$user",
            displayName: "$userObj.displayName",
            profilePicUrl: "$userObj.profilePicUrl",
            rate: "$rate",
            review: "$review",
            date: "$date"
          }
        }
      ],
      as: "reviews"
    })
    .project({
      _id: 1,
      productName: 1,
      productDscrp: 1,
      productImgUrl: 1,
      average: {
        $avg: "$reviews.rate"
      },
      totalReviews: {
        $size: {
        $filter: {
        input: "$reviews",
        as: "review",
        cond: { $ne: ["$$review.review", ""] }
         }
        }
      },
      ratings: {
        $size: {
          $setUnion: ["$reviews._id"]
        }
      },
      reviews: 1
    })  
  .exec((err, productPrev) => {
    if (productPrev.length === 0) {
      res.render("error", { message: "Product not found" });
    } else {
      if (productPrev[0].average) {
        productPrev[0].average = parseFloat(productPrev[0].average.toFixed(1));
      }
      productPrev[0].reviews.forEach(element => {
        if (element.date) {
          element.date = element.date.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });
        }
      });
      const success = req.flash("success") || [];
      res.render("product", { productPrev: productPrev, success });
    }
  });

});

app.get("/review/:_id", checkIfNotAuthenticated, function(req, res){
  const getUrl = req.params._id;
  Review.aggregate([
    {
      $match: { product: mongoose.Types.ObjectId(getUrl) }
    },
    {
      $group: {
        _id: "$product",
        count: { $sum: { $cond: [{ $ne: ["$review", ""] }, 1, 0] } },
        average: { $avg: "$rate" },
        users: { $addToSet: "$user" },
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: "$product"
    },
    {
      $project: {
        _id: "$product._id",
        productName: "$product.productName",
        productImgUrl: "$product.productImgUrl",
        average: { $round: ["$average", 1] },
        totalReviews: { $sum: "$count" },
        ratings: { $size: "$users" },
        reviews: 1
      }
    }
  ])
  .exec((err, productPrev) => {
    if (err) {
      console.error(err);
    } else {
      const errors = req.flash("error") || [];
      res.render("review", { productPrev: productPrev, errors });
    }
  });

});

async function account(id) {
  try {
    const user = await User.findById(id)
    const reviews = await Review.find({ user: id })
      .populate("product", "productName productImgUrl")
      .select("rate review date")
      .lean();

    // format date and base64 encode product image
    reviews.forEach((review) => {
      if (review.date) {
        review.date = review.date.toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });
      }
    });

    const reviewCount = await Review.countDocuments({ user: id, review: { $exists: true, $ne: "" } })
    const rateCount = await Review.countDocuments({ user: id, rate: { $exists: true } })
    return {
      user: {
        displayName: user.displayName,
        bio: user.bio,
        profilePicUrl: user.profilePicUrl
      },
      reviewCount,
      rateCount,
      reviews
    }
  } catch (err) {
    console.error(err)
  }
}

app.get("/profile", checkIfNotAuthenticated, function(req, res) {
  const userId = req.user._id;
  
  account(userId).then((currentUser) => {
    res.render('profile', {
      currentUser: currentUser,
      hideButtons: false
    });
  }).catch((err) => {
    console.log(err);
    res.redirect('/');
  });
});


// other users profile with search
app.get("/profile/:_id", function(req, res) {
  let getUrl = req.params._id;
  User.findById(getUrl, function(err, foundId) {
    account(foundId._id)
  
  .then((result) => { 
    res.render("profile", { currentUser: result, hideButtons: true });
  })
  .catch((error) => {
    console.log(error);
    res.render("error");
  });
  })
});

app.get("/account-setting",checkIfNotAuthenticated, function(req, res) {
  let getUrl = req.user._id;

  account(getUrl)
  .then((result) => {
    res.render("account-setting", { currentUser:result });
  })
  .catch((error) => {
    console.log(error);
    res.render("error");
  });
  });

app.post("/account-setting", async (req, res) => {
  const { displayName, bio, profilePicUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { displayName, bio, profilePicUrl},
    { new: true }
  );

  res.redirect("/profile");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("this is running Successfully");
});
