// Plugin Passport-Local Mongoose

// Importing Mongoose and Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');

// Creating Schema
const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose);

// Creating and Exporting Model
module.exports = mongoose.model('User', UserSchema);