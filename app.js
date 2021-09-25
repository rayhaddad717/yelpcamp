//if we are in development mode require dotenv
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const methodOverride = require('method-override')
//I include ejs mate
const ejsMate = require('ejs-mate')

const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError');
if (process.PORT) {
    //mongo atlas db
    const connectionString = `mongodb+srv://ray:${process.env.mongoPassword}@cluster0.ugkjk.mongodb.net/
    yelp-camp?retryWrites=true&w=majority`;
    mongoose.connect(connectionString);

} else {
    //local dev
    mongoose.connect('mongodb://localhost:27017/yelp-camp');
}


const db = mongoose.connection;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database connected')
})

const app = express();

//I tell my app to use ejs mate
app.engine('ejs', ejsMate)
//define our template engine and set its path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
//send the public folder contents with the response
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash());


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
app.use(session(sessionConfig));
app.use(passport.initialize());
//we should make sure that app.use(passport.sesssion()) comes after app.use(session(...))
app.use(passport.session());
//will tell passport how to authenticate a user
passport.use(new LocalStrategy(User.authenticate()));
//will tell passport how to store(serialize) and how to unstore a user (deserialize)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    //we want our flash messages to be available in all future templates without requiring them
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    //now in all my templates i will have access to my current logged in user (not logged in=undefined)
    res.locals.currentUser = req.user;
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
//here id is in the req.params
app.use('/campgrounds/:id/reviews', reviewRoutes);


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


//Start listening
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () =>
    console.log(`listening on port ${port}`))