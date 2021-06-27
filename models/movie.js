var mongoose = require("mongoose")

var imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    length: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    movietype: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Image", imageSchema)