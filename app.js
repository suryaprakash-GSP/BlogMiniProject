//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const mongodb = require('mongodb');

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

// let posts = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect('mongodb://127.0.0.1:27017/blogDB');

const postSchema = {
  title: String,
  content: String,
  image: String,
  author: String,
  date: String,

};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {

  Post.find({}).then(function (postsArray) {

    res.render("home", {

      postsArray: postsArray,

    });

  })
    .catch(function (err) {
      console.log(err);
    })

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
  res.render("about", { aboutitem: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact");
})

app.get("/composes", function (req, res) {

  res.render("composes");
});



app.post("/compose", function (req, res) {




  const post = new Post({

    title: req.body.newItem,
    author: req.body.author,
    date: req.body.date,
    content: req.body.post,
    image: req.body.image,


  });
  post.save();

  res.redirect("/");
})




app.get("/posts/:postId", function (req, res) {




  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }).then(function (item) {


    res.render("post", {
      post: item
    });

  })
    .catch(function (err) {
      console.log(err);
    })


});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
