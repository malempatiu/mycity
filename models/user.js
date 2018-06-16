const mongoose = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');

//================ User Info Schema ================
const userSchema = new mongoose.Schema({
     
     username: String,
     password: String
      
});

//Adds the auth methods to the user
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);