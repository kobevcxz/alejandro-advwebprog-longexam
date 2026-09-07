const jwt = require("jsonwebtoken");
const { HttpStatus } = require("../config/constants");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};