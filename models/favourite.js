var mongoose = require("mongoose")

var favSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    movieId:{
        type: String,
        required: true
    },
    fav_title: {
        type: String,
        required: true
    },
    fav_description: {
        type: String,
        required: true
    },
    fav_length: {
        type: String,
        required: true
    },
    fav_price: {
        type: String,
        required: true
    },
    fav_genre: {
        type: String,
        required: true
    },
    fav_movietype: {
        type: String,
        required: true
    },
    fav_date: {
        type: String,
        required: true
    },
    fav_image: {
        type: String,
        required: true
    },
    fav_rating: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Favourite", favSchema)