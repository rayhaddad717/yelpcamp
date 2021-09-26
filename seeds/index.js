const mongoose = require('mongoose')
const cities = require('./cities')
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers')

//mongoose.connect('mongodb://localhost:27017/yelp-camp')

const connectionString = `mongodb+srv://ray:${process.env.mongoPassword}@cluster0.ugkjk.mongodb.net/yelp-camp?retryWrites=true&w=majority`;
mongoose.connect(connectionString);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected')
})

//My code to get random images
const axios = require('axios')
const getRandomImage = async () => {
    const res = await axios.get('https://api.unsplash.com/photos/random?collections=155011&client_id=hjUuI5ipgebPK6qbp72AF-rwCjjYVANdYSEBvTO4Uo0');
    return res.data;
    //.urls.full;
}
//end of my code


//a function to return a random element form an array
const sample = (array) => (
    array[Math.floor(Math.random() * array.length)]
)

//function to remove everything in the database and then inserting random values
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        // const image = await getRandomImage();
        const camp = new Campground({
            author: '614d605f9f8f701f9f938c1c',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'nice place',
            geometry: {
                type: 'Point',
                coordinates: [35.51306, 33.88694]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/ds1hbolom/image/upload/v1632550281/Yelp-Camp/edj01a9ijh7iimsrvgr4.jpg',
                    filename: 'Yelp-Camp/edj01a9ijh7iimsrvgr4'
                },
                {
                    url: 'https://res.cloudinary.com/ds1hbolom/image/upload/v1632550282/Yelp-Camp/f6kfvggb05utpqkbcdqh.jpg',
                    filename: 'Yelp-Camp/f6kfvggb05utpqkbcdqh'
                }
            ],

            // description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quis cumque itaque dolorum minima ut voluptatibus a, similique ratione cupiditate minus? Voluptates accusantium explicabo provident numquam. Temporibus incidunt repellat nihil quis.',
            price
        })
        await camp.save();
    }
}
//seedDB returns a promise since it is an async function
// we want to close the connection when we're done

//comment this function for now
seedDB().then(() => { mongoose.connection.close() })

