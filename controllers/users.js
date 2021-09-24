const User = require('../models/user');

//for '/register'
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

//for '/register' post
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            //if no error when loggin in
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

//for '/login' get
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

//for '/login' post
module.exports.login = (req, res) => {
    req.flash('success', 'welcome back');

    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

//for '/logout' 
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'logged you out');
    res.redirect('/campgrounds');
};