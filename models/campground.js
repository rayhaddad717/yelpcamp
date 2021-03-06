const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});
//normal:
// https://res.cloudinary.com/ds1hbolom/image/upload/v1632550282/Yelp-Camp/f6kfvggb05utpqkbcdqh.jpg
//my thumbnail:
//https://res.cloudinary.com/ds1hbolom/image/upload/w_300/v1632550282/Yelp-Camp/f6kfvggb05utpqkbcdqh.jpg
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');

});
const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong> <a href="/campgrounds/${this._id}"> ${this.title}</a> </strong>
    <p>${this.description.substring(0, 25)}... </p>`;
});

//adding delete middleware to delete the reviews after deleting a campground
CampgroundSchema.post('findOneAndDelete', async function (document) {
    //if we did find a document and we delete it
    if (document) {
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema)