require('dotenv').config();
//================ Importing Third Party Libraries and Modules ==================
const express    = require('express'),
      router     = express.Router(),
      multer     = require('multer'),
      cloudinary = require('cloudinary'),
      axios      = require('axios');
      
//======================= Importing Local Files ================================      
const CityAttractionDb = require('../models/cityattractions'),
      middleware       = require('../middleware');


//=============== Image Upload Config ==================
const storage = multer.diskStorage({
    
       filename: function(req, file, callback) {
             callback(null, Date.now() + file.originalname);
        }
        
    });

const imageFilter = function (req, file, cb) {
    
       // accept image files only
       if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
             return cb(new Error('Only image files are allowed!'), false);
       }
       cb(null, true);
       
    };

const upload = multer({ storage: storage, fileFilter: imageFilter});

cloudinary.config({
    
     cloud_name: 'cityattractionimages', 
     api_key: process.env.CLOUDINARY_API_KEY, 
     api_secret: process.env.CLOUDINARY_API_SECRET
  
    });


//=================== City Attraction Routes ===============
//Index Route == List all city attractions
router.get('/attractions', (req, res) => {
    
       //Reading all attractions from DB and Rendering Index Template with DB data
       CityAttractionDb.find({}, (err, attractionsDbData) => {
           
             err ? res.redirect('/') : res.render('attractions/index', {attractionsDbData: attractionsDbData});
             
       });
    });

//New Route == Shows new form to create city attraction
router.get('/attractions/new', middleware.isLoggedIn, (req, res) => {
    
       //Rendering Form Template for Index
       res.render('attractions/new');
       
    });

//Create Route == Create a new city attraction in DB and redirects to Index route
router.post('/attractions', middleware.isLoggedIn, upload.single('attractionImage'), (req, res) => {
      
       cloudinary.uploader.upload(req.file.path, (result) => {
           
             //Create a new city attraction
             const author = {
                 id: req.user._id,
                 username: req.user.username
             };
             
             let newCityAttractionData = {attractionName: req.body.attractionName, attractionImage: result.secure_url, attractionLocation: req.body.attractionLocation, attractionDescription: req.body.attractionDescription, attractionAuthor: author};
             CityAttractionDb.create(newCityAttractionData, (err, createdData) => {
                 
                   err ? res.redirect('back') : res.redirect('/attractions');
                   
             });
        });
    });

//Show Route == Shows info about one specific attraction
router.get('/attractions/:id', (req, res) => {
    
     let latitude;
     let longitude;
     let spot;
     //finding attraction by its id
     CityAttractionDb.findById(req.params.id).populate('attractionComments').exec ( (err, showSpecificAttraction) => {
         
         if (err) {
             
             res.redirect('back');
             
         } else {
             
             //============ Fetching Latitutde and Longitude data from GOOGLE API for the attraction location ============
             let encodedAddress = encodeURIComponent(`${showSpecificAttraction.attractionLocation}`);
             let geocodeURL     =  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GEOCODE_API_KEY }`;
             //============ Making request ========= 
             axios.get(geocodeURL).then((response) => {
      
                     if (response.data.status === 'ZERO_RESULTS') {
                         
                           throw new Error('Unable to find that address');
                           
                        } else {
                                 spot = response.data.results[0].formatted_address;
                                 latitude = response.data.results[0].geometry.location.lat;
                                 longitude = response.data.results[0].geometry.location.lng;
                                 let weatherURL = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_SECRET}/${latitude},${longitude}`;
                                 return axios.get(weatherURL);
                            
                            }
                }).then((response) => {
                         
                         //Temperature Data 
                         let temperatureInFahrenheit = parseFloat(JSON.stringify(response.data.currently.temperature));
                         //converting fahrenheit to celcius
                         let temperatureInCelcius = Math.floor((temperatureInFahrenheit - 32) * 5/9);
                         let weatherTemperature = `${temperatureInCelcius}°C`;
                         
                         //Weather summary and icon
                         let weatherSummary = JSON.stringify(response.data.currently.summary);
                         let weatherIconText    = JSON.stringify(response.data.currently.icon);
                         let weatherIconSummary = weatherIconText.slice(1, weatherIconText.length-1);
                         let weatherIcon = fetchWeatherIcon(weatherIconSummary);
                         
                         //Humidity and Pressure
                         let weatherHumidity = parseFloat(JSON.stringify(response.data.currently.humidity));
                         let weatherHumidityInPercentage = `${Math.floor(weatherHumidity * 100)}%`;
                        
                         let weatherPressure = `${parseFloat(JSON.stringify(response.data.currently.pressure))}mb`;
                         
                         //Weather Data
                         const weatherData = {
                                 location: spot,
                                 lat: latitude,
                                 lng: longitude,
                                 temperature: weatherTemperature,
                                 summary: weatherSummary,
                                 icon: weatherIcon,
                                 humidity: weatherHumidityInPercentage,
                                 pressure: weatherPressure
                                 
                            };
                         
                         //rendering show template
                         res.render('attractions/show', {showSpecificAttraction: showSpecificAttraction, weatherData: weatherData});
             
                          
                    }).catch((e) => {
                        
                             e.code === 'ENOTFOUND' ? console.log('Unable to connect to API server') : console.log(e.message);
                             
                        });
            }
        });
    });
    
//Edit Route == shows edit form for one city attraction
router.get('/attractions/:id/edit', middleware.checkAttractonOwnership, (req, res) => {
     
     CityAttractionDb.findById(req.params.id, (err, attractionToEdit) => {
        
         err ? res.redirect('back') : res.render('attractions/edit', {attractionToEdit: attractionToEdit});
        
     });
});

//Update route == updates specific city attraction and redirects to that specific edited attraction
router.put('/attractions/:id', middleware.checkAttractonOwnership, upload.single('attractionImage'), (req, res) => {
    
     cloudinary.uploader.upload(req.file.path, (result) => {
           
             const author = {
                 id: req.user._id,
                 username: req.user.username
             };
             
             let newCityAttractionData = {attractionName: req.body.attractionName, attractionImage: result.secure_url, attractionLocation: req.body.attractionLocation, attractionDescription: req.body.attractionDescription, attractionAuthor: author};
             //finding and updating city attraction
             CityAttractionDb.findByIdAndUpdate(req.params.id, newCityAttractionData, (err, updatedData) => {
                 
                   err ? res.redirect('back') : res.redirect(`/attractions/${updatedData._id}`);
                   
             });
        });
});

//Delete Route == Removes a specific city attraction and redirects to index
router.delete('/attractions/:id', middleware.checkAttractonOwnership, (req, res) => {
    
      CityAttractionDb.findByIdAndRemove(req.params.id, (err) => {
         
         err ? res.redirect('back') : res.redirect('/attractions');
          
      });
});
    
const fetchWeatherIcon = (weatherText) => {
         
         const weatherDataIcon = [
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/clearday.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/clearnight.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/cloudy.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/cloudynight.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/cloudyd.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/rain.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/sleet.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/snow.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/wind.png',
             'http://res.cloudinary.com/cityattractionimages/image/upload/v1528921389/fog.png'
             ];
         
         const weatherIcons = ['clear-day', 'clear-night', 'partly-cloudy-day', 'partly-cloudy-night', 'cloudy', 'rain', 'sleet', 'snow', 'wind', 'fog'];
         
         for (let i = 0; i < weatherIcons.length; i++) {
             
                 if (weatherIcons[i] === weatherText) {
                     
                         return weatherDataIcon[i];  
                     
                    } 
            }
    };
    
module.exports = router;