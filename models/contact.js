const mongoose = require("mongoose")

const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true 
    },
    phone: {
         type: String,
         required: true
     },
    review: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Contact", contactSchema)