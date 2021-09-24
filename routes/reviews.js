const express = require('express');
//i merge the req.params of the router here and the route in the app.js
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')


//post a new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;