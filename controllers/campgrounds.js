const Campground = require('../models/campground');
// '/' route
module.exports.index = async (req, res) => {
    //get all the campgrounds from the database and pass them to campgrounds/index to render them on the page
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
};

// for '/new' route
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

//for '/' post
module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Sucessfully created a new campground!');
    //campground will automatically update its id
    res.redirect(`/campgrounds/${campground._id}`)
};

//for '/:id'
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        //populate author on each review
        populate: {
            path: 'author'
        }
    }
        //populate the author on the campground
    ).populate('author');
    if (!campground) {
        req.flash('error', 'cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
};

//for '/:id/edit'
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'cannot find that campground! ');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
};

//for '/:id' put
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    req.flash('success', 'successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)

};

//for '/:id' delete
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const deletedCampground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground');
    res.redirect('/campgrounds')
};