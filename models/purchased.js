var mongoose = require("mongoose")

var purSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    movieId:{
        type: String,
        required: true
    },
    pur_title: {
        type: String,
        required: true
    },
    pur_description: {
        type: String,
        required: true
    },
    pur_length: {
        type: String,
        required: true
    },
    pur_price: {
        type: String,
        required: true
    },
    pur_genre: {
        type: String,
        required: true
    },
    pur_movietype: {
        type: String,
        required: true
    },
    pur_date: {
        type: String,
        required: true
    },
    pur_image: {
        type: String,
        required: true
    },
    pur_rating: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Purchased", purSchema)