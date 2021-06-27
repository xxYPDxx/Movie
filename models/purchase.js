var mongoose = require("mongoose")

var buySchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    movieId:{
        type: String,
        required: true
    },
    buy_title: {
        type: String,
        required: true
    },
    buy_description: {
        type: String,
        required: true
    },
    buy_length: {
        type: String,
        required: true
    },
    buy_price: {
        type: String,
        required: true
    },
    buy_genre: {
        type: String,
        required: true
    },
    buy_movietype: {
        type: String,
        required: true
    },
    buy_date: {
        type: String,
        required: true
    },
    buy_image: {
        type: String,
        required: true
    },
    buy_rating: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Purchase", buySchema)