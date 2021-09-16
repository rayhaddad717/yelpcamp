module.exports.isLoggedIn = (req, res, next) => {
    //i save the route that the user wanted to go to before being logged in (if any)
    req.session.returnTo = req.originalUrl;
    //passport provides us with this method to the request object
    //it will store whether a user is athenticated in the session automatically
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
}
