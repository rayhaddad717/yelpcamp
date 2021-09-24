const Review = require('../models/review');
const Campground = require('../models/campground');
//for '/'
module.exports.createReview = async (req, res) => {

    //here i have a separate req.params that doesn't have the id
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};

//for '/reviewId' delete
module.exports.deleteReview = async (req, res) => {
    const { reviewId, id } = req.params;
    //remove the review object id from the campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)

};