const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

router.get('/', catchAsync(campgrounds.index)
)

//I must put this route ahead of the :id or else it will consider 'new' to be an id
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

//we call the catchAsync to catch any errors during the execution of the async function
//we give a validateCampground middleware to validate our campground before sending it
router.post('/', validateCampground, catchAsync(campgrounds.createCampground))

//show one campground
router.get('/:id', catchAsync(campgrounds.showCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

//delete a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


module.exports = router;