const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
//validate a campground middleware
const validateCampground = (req, res, next) => {
    //this is not a mongoose schema, this will validate our data before we even try to save it to mongoose

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, '400');
    } else { next(); }


}

router.get('/', catchAsync(async (req, res) => {
    //get all the campgrounds from the database and pass them to campgrounds/index to render them on the page
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})
)

//I must put this route ahead of the :id or else it will consider 'new' to be an id
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

//we call the catchAsync to catch any errors during the execution of the async function
//we give a validateCampground middleware to validate our campground before sending it
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Sucessfully created a new campground!');
    //campground will automatically update its id
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show one campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    req.flash('success', 'successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)

}))

//delete a campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground');
    res.redirect('/campgrounds')
}))


module.exports = router;