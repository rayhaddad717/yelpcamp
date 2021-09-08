const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground');
const methodOverride = require('method-override')
//I include ejs mate
const ejsMate = require('ejs-mate')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas')
mongoose.connect('mongodb://localhost:27017/yelp-camp')

const Review = require('./models/review');
const review = require('./models/review');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected')
})

const app = express()
const port = 3000;

//I tell my app to use ejs mate
app.engine('ejs', ejsMate)
//define our template engine and set its path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

//validate a campground middleware
const validateCampground = (req, res, next) => {
    //this is not a mongoose schema, this will validate our data before we even try to save it to mongoose

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }


}

//validate reviews
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }
}

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/campgrounds', catchAsync(async (req, res) => {
    //get all the campgrounds from the database and pass them to campgrounds/index to render them on the page
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})
)

//I must put this route ahead of the :id or else it will consider 'new' to be an id
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

//we call the catchAsync to catch any errors during the execution of the async function
//we give a validateCampground middleware to validate our campground before sending it
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    //campground will automatically update its id
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show one campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id/', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)

}))

//delete a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))


//post a new review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {

    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

//delete a review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { reviewId, id } = req.params;
    //remove the review object id from the campground
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)

}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})
//custom error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = "Oh No! Something went wrong." }
    res.status(statusCode).render('error', { err })
})
app.listen(port, () =>
    console.log(`listening on port ${port}`))