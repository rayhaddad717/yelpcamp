const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const methodOverride = require('method-override')
//I include ejs mate
const ejsMate = require('ejs-mate')

const session = require('express-session')

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const ExpressError = require('./utils/ExpressError');
mongoose.connect('mongodb://localhost:27017/yelp-camp')
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
app.use(methodOverride('_method'));

app.use('/campgrounds', campgrounds);
//here id is in the req.params
app.use('/campgrounds/:id/reviews', reviews);

//send the public folder contents with the response
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    // we will set an expiration date for the cookie
    cookie: {
        //date.now() will return the current date in milliseconds
        //i set the expiry date one week from the current date
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionConfig))

app.get('/', (req, res) => {
    res.render('home')
})


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