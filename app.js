//if we are in development mode require dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const methodOverride = require("method-override");
//I include ejs mate
const ejsMate = require("ejs-mate");

const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");

//if (process.env.PORT) {
//mongo atlas db
// const connectionString = `mongodb+srv://ray:${process.env.mongoPassword}@cluster0.ugkjk.mongodb.net/yelp-camp?retryWrites=true&w=majority`;
const connectionString = `mongodb+srv://rayghaddad:${process.env.mongoPassword}@cluster0.bsgqosu.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(connectionString);

//} else {
//local dev
//    mongoose.connect('mongodb://localhost:27017/yelp-camp');
//}

const db = mongoose.connection;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongo");

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

//I tell my app to use ejs mate
app.engine("ejs", ejsMate);
//define our template engine and set its path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
//send the public folder contents with the response
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
app.use(flash());

//content security policy
//setting the allowed sources
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/ds1hbolom/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//create a store in mongodb to store the sessions
const secret = process.env.SECRET;
const store = MongoDBStore.create({
  mongoUrl: connectionString,
  secret,
  touchAfter: 24 * 3600,
});
store.on("error", function (e) {
  console.log("session store error", e);
});
const sessionConfig = {
  name: "bonus",
  //add the store
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  // we will set an expiration date for the cookie
  cookie: {
    //date.now() will return the current date in milliseconds
    //i set the expiry date one week from the current date
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    //secure means the cookie can only be configured over https (localhost is not https)
    // secure:true;
  },
};
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
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  //now in all my templates i will have access to my current logged in user (not logged in=undefined)
  res.locals.currentUser = req.user;
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
//here id is in the req.params
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});
//custom error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Oh No! Something went wrong.";
  }
  res.status(statusCode).render("error", { err });
});

//Start listening
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
