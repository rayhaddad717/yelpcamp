const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//passLocalMongoose will add username and password to our user schema
// and make sure the username is unique
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema);