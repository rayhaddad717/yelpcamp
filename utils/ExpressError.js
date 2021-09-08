class ExpressError extends Error {
    constructor(message, statusCode) {
        //calls constructor of Error
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
module.exports = ExpressError;