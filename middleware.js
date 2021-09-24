const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review')
const { campgroundSchema, reviewSchema } = require('./schemas');

module.exports.isLoggedIn = (req, res, next) => {
    //i save the route that the user wanted to go to before being logged in (if any)
    req.session.returnTo = req.originalUrl;
    //passport provides us with this method to the request object
    //it will store whether a user is athenticated in the session automatically
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
}
//validate a campground middleware
module.exports.validateCampground = (req, res, next) => {
    //this is not a mongoose schema, this will validate our data before we even try to save it to mongoose

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }


}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next();
}
//validate reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}