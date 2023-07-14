// Requiring module
const mongoose = require('mongoose');

// Course Modal Schema

const postSchemaa = new mongoose.Schema({
    title: String,
    content: String,
    image: String,
    author: String,
    date: String,
});


// Creating model objects
const Post = mongoose.model('user', postSchemaa);



// Exporting our model objects
module.exports = {
    Post
}
