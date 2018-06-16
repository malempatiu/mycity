//============= Authentication Middleware ======================
const CityAttractionDb        = require('../models/cityattractions');
      
const middlewareFunctions = {};

middlewareFunctions.isLoggedIn = (req, res, next) => {
     if(req.isAuthenticated()){
             return next();
        }
         req.flash('error', 'Login is required to do that');
         res.redirect("/login");
};

middlewareFunctions.checkAttractonOwnership = (req, res, next) => {
     if(req.isAuthenticated()){
         
        CityAttractionDb.findById(req.params.id, (err, foundAtrraction) => {
            
            if(err) {
                req.flash('error', 'City Atrraction Not Found');
                res.redirect('back');
            } else {
                
                 if(foundAtrraction.attractionAuthor.id.equals(req.user._id)) {
                     next();
                 } else {
                     req.flash('Permission Denied');
                     res.redirect('back');   
                    }
                }               
            });
        } else {
             req.flash('error', 'Login is required to do that');
             res.redirect('back');
        }  
};


module.exports = middlewareFunctions;