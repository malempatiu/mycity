//================ Importing Third Party Libraries and Modules ==================
const express               = require('express'),
      app                   = express(),
      bodyParser            = require('body-parser'),
      mongoose              = require('mongoose'),
      passport              = require('passport'),
      passportLocal         = require('passport-local'),
      session               = require('express-session'),
      methodOverride        = require('method-override'),
      flash                 = require('connect-flash');
      
//======================= Importing Local Files and Routes ================================      
const User                 = require('./models/user'),
      attractionsRoutes    = require('./routes/attractions'),
      commentsRoutes       = require('./routes/comments'),
      authenticationRoutes = require('./routes/index');

//===================== APP Config ============================================
//mongoose.connect('mongodb://localhost/my_city_attractions');
mongoose.connect('mongodb://mycity:4455ece7119@ds261470.mlab.com:61470/my_city_attractions'); 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
app.locals.moment = require('moment');

//============= Passport Config ==========
app.use(session({
     secret: 'My City Attractions',
     resave: false,
     saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============ Locals Config ===============
app.use((req, res, next) => {
     res.locals.currentUser = req.user;
     res.locals.error = req.flash('error');
     res.locals.success = req.flash('success');
     next();
});

//============== Routes Config ============
app.use(authenticationRoutes);
app.use(attractionsRoutes);
app.use(commentsRoutes);

app.listen(process.env.PORT, process.env.IP);