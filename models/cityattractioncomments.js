const mongoose = require('mongoose');

//============ Comments Schema ==============
const attractionComments = new mongoose.Schema({
     
       comment: String,
       commentCreatedAt: { type: Date, default: Date.now },
       author: {
              
               id: {
                      
                      type: mongoose.Schema.Types.ObjectId,
                      ref: 'User'
                      
               },
               
               username: String
              
       }
     
});


module.exports = mongoose.model('CityAttractionComment', attractionComments);