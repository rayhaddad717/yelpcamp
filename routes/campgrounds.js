const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { storage } = require('../cloudinary/index');
const multer = require('multer');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    //we call the catchAsync to catch any errors during the execution of the async function
    //we give a validateCampground middleware to validate our campground before sending it
    //image is the field from the input type name in form
    //-- upload.array() will parse the body, so we cannot put validate campground before upload even though we shouldn't upload an image before validating the given data
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));


//I must put this route ahead of the :id or else it will consider 'new' to be an id
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //show one campground
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;