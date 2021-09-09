const express = require('express');
//i merge the req.params of the router here and the route in the app.js
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
//validate reviews
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }
}


//post a new review
router.post('/', validateReview, catchAsync(async (req, res) => {

    //here i have a separate req.params that doesn't have the id
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { reviewId, id } = req.params;
    //remove the review object id from the campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)

}))

module.exports = router;