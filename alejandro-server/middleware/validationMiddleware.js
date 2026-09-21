const { body, validationResult } = require('express-validator');

const registerValidation = [
    body('firstName')
        .isString()
        .withMessage('First name must be a string')
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long'),

    body('lastName')
        .isString()
        .withMessage('Last name must be a string')
        .isLength({ min: 2 })
        .withMessage('Last name must be at least 2 characters long'),

    body('age')
        .isInt({ min: 1 })
        .withMessage('Age must be a valid number'),

    body('gender')
        .isIn(['male', 'female'])
        .withMessage('Gender must be male or female'),

    body('contactNumber')
        .isString()
        .withMessage('Contact number must be a string')
        .isLength({ min: 10, max: 11 })
        .withMessage('Contact number must be 10 to 11 digits long'),

    body('email')
        .isEmail()
        .withMessage('Invalid email address'),

    body('role')
        .isIn(['Admin', 'Seller', 'Buyer'])
        .withMessage('Role must be Admin, Seller, or Buyer'),

    body('username')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 4 })
        .withMessage('Username must be at least 4 characters long'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('address')
        .isString()
        .withMessage('Address must be a string'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();
    }
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Invalid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        next();
    }
];

module.exports = {
    registerValidation,
    loginValidation
};