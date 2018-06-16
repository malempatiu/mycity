//================ Importing Third Party Libraries and Modules ==================
const express = require('express'),
      router  = express.Router();
      
//======================= Importing Local Files ================================      
const CityAttractionDb      = require('../models/cityattractions'),
      CityAttractionComment = require('../models/cityattractioncomments'),
      middleware            = require('../middleware');

//==================== City Attraction Comments ======================
//New Route == Shows new form to create comment
router.get('/attractions/:id/comments/new', middleware.isLoggedIn, (req, res) => {
     
     //finding specific attraction
     CityAttractionDb.findById(req.params.id, (err, attractionToComment) => {
         
         err ? res.redirect('back') : res.render('comments/new', {attractionToComment: attractionToComment});
         
     });
});
        
//Create Route == Create a new comment in DB and redirects to attraction show route
router.post('/attractions/:id/comments', middleware.isLoggedIn, (req, res) => {
     
     //finding attraction with its id to save comments
     CityAttractionDb.findById(req.params.id, (err, cityAttraction) => {
         
         if (err) {
             
             res.redirect('back');
             
         } else {
             
             //creating comments
             const attractionComments = {comment: req.body.attractionComment};
             CityAttractionComment.create(attractionComments, (err, createdComment) => {
                
                 if (err) {
                     
                      req.flash('error', 'Something went wrong');
                      
                 } else {
                     //adding username and id to comment
                     createdComment.author.id = req.user._id;
                     createdComment.author.username = req.user.username;
                     createdComment.save();
                     //saving comment to db
                     cityAttraction.attractionComments.push(createdComment);
                     cityAttraction.save();
                     //redirecting to attraction show page
                     req.flash('success', 'Successfully created comment');
                     res.redirect(`/attractions/${cityAttraction._id}`);
                     
                 }
                 
             });
         }
     });
});


module.exports = router;