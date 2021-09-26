const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });
// '/' route
module.exports.index = async (req, res) => {
    //get all the campgrounds from the database and pass them to campgrounds/index to render them on the page
    const campgrounds = await Campground.find({})
    console.log(campgrounds[0].images[0].url)
    res.render('campgrounds/index', { campgrounds })
};

// for '/new' route
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
};

//for '/' post
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    //now we have access to req.files
    //this map will give us an array made up of these objects ()means implicit return
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
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
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {

        //remove from the images array all images having the filename in the deleteImages array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
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