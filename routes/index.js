//================ Importing Third Party Libraries and Modules ==================
const express  = require('express'),
      router   = express.Router(),
      passport = require('passport');
      
//======================= Importing Local Files ================================      
const User  = require('../models/user');
router.get('/', (req, res) => {
     res.redirect('/attractions');
});

//==================== Authentication Routes =============================
//Register Route === Shows user registration form
router.get('/register', (req, res) => {
    
     res.render('authentication/register');
    
});

//Handling Signup logic
router.post('/register', (req, res) => {
   
     //registering new user details
     const newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, (err, registeredUser) => {
        
         if (err) {
             
              req.flash('error', err.message);
              res.render('authentication/register');
              
         } else {
          
             passport.authenticate('local')(req, res, () => {
                
                 req.flash('success', 'Successfully registered');
                 //redirecting to city attractions new form
                 res.redirect('/attractions/new');
                 
             });
         }
     });
});


//Show Login Form
router.get('/login', (req, res) => {
   
     res.render('authentication/login');
    
});

//Handling Login Logic
router.post('/login', passport.authenticate('local', {
    
     successRedirect: '/attractions',
     failureRedirect: '/login'
    
}), (req, res) => {
});

//Logout Route
router.get('/logout', (req, res) => {
   
     req.logout();
     req.flash('success', 'Loged out successfully!');
     res.redirect('/attractions');
    
});

module.exports = router;