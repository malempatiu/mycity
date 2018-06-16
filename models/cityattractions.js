const mongoose = require('mongoose');

//============== Mongoose Config ==============
const cityAttractionsSchema = new mongoose.Schema({
    
       attractionName: String,
       attractionImage: String,
       attractionLocation: String,
       attractionDescription: String,
       attractionCreatedAt: { type: Date, default: Date.now },
       attractionAuthor: {
               id: {
                      type: mongoose.Schema.Types.ObjectId,
                      ref: 'User'
               },
               username: String
       },
       attractionComments: [
                {
                       type: mongoose.Schema.Types.ObjectId,
                       ref: 'CityAttractionComment'
                }
              ]
    });

module.exports = mongoose.model('CityAttractionDb', cityAttractionsSchema);