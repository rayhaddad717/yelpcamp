const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
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
})

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