const { HttpStatus } = require("../config/constants");

module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: "Access forbidden",
            });
        }

        next();
    };
};