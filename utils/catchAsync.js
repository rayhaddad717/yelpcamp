module.exports = func => {
    return function (req, res, next) {
        func(req, res, next).catch(next)
        //not sure why it isn't catch(e=>next(e))
    }
}