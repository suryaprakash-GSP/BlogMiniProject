

require('dotenv').config()
const express = require('express');
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");
const { Post } = require('./models.js');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://127.0.0.1:27017/blogDB');
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  post: [],

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



const User = new mongoose.model("User", userSchema);



passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLINT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  passReqToCallback: true,
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userInfo",
},
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));


app.get("/", (req, res) => {
  res.render('home');
});
app.get("/nologout", (req, res) => {

  User.find({}).then(function (foundUser) {
    if (foundUser) {

      res.render("nologout", { userswithSecrets: foundUser });
    }


  })
    .catch(function (err) {
      console.log(err);
    })


});

app.get("/auth/google",
  passport.authenticate('google', {
    scope:
      ["profile"]
  }
  ));

app.get("/auth/google/secrets",

  passport.authenticate('google', {
    successRedirect: "/allposts",
    failureRedirect: "/login"
  }));
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/search", (req, res) => {


  Post.find({}).then(function (postsArray) {



    res.render("search", {

      postsArray: postsArray,

    });

  })
    .catch(function (err) {
      console.log(err);
    })
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/contact", function (req, res) {
  res.render("contact");
})

app.get("/composes", function (req, res) {

  if (req.isAuthenticated()) {
    res.render("composes");

  }
  else {
    res.redirect("/login");
  }
});
app.get("/allposts", (req, res) => {
  if (req.isAuthenticated()) {
    User.find({}).then(function (foundUser) {
      if (foundUser) {

        res.render("allposts", { userswithSecrets: foundUser });
      }


    })
      .catch(function (err) {
        console.log(err);
      })


  }
  else {
    res.redirect("/nologout");
  }

  User.find({}).then(function (foundUser) {
    if (foundUser) {

      res.render("allposts", { userswithSecrets: foundUser });
    }


  })
    .catch(function (err) {
      console.log(err);
    })


});

app.post("/register", (req, res) => {


  User.register({ username: req.body.username, active: false }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);

      res.redirect("/login");
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/allposts");
      })

    }


  });


});

app.post("/login", (req, res) => {

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    }
    else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/allposts");
      })
    }
  });

});
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

});


app.post("/composes", function (req, res) {
  const submittedpost = {
    title: req.body.newItem,
    author: req.body.author,
    date: req.body.date,
    content: req.body.post,
    image: req.body.image,
  };
  const post = new Post({

    title: req.body.newItem,
    author: req.body.author,
    date: req.body.date,
    content: req.body.post,
    image: req.body.image,


  });
  post.save();


  const requestedId = req.user._id;
  console.log(requestedId);

  User.findOne({ _id: requestedId }).then(function (foundUser) {
    if (foundUser) {
      foundUser.post.push(submittedpost);
      foundUser.save();
      res.redirect("/allposts");
    }


  })
    .catch(function (err) {
      console.log(err);
    })


});

app.get("/myBlogs", (req, res) => {


  if (req.isAuthenticated()) {
    const requestedId = req.user._id;
    console.log(requestedId);

    User.findOne({ _id: requestedId }).then(function (foundUser) {
      if (foundUser) {

        res.render("userBlogs", {
          posts: foundUser.post,
        });
      }


    })
      .catch(function (err) {
        console.log(err);
      })


  }
  else {
    res.redirect("/login");
  }


})




app.get("/posts/:posttitle", function (req, res) {




  const requestedPostId = req.params.posttitle;


  Post.findOne({ title: requestedPostId }).then(function (item) {




    res.render("post", {
      post: item,

    });

  })
    .catch(function (err) {
      console.log(err);
    })


});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
