const express = require('express');

const { getUsers, getUserById, createUser, updateUser, deleteUser, loginUser } = require('../controllers/userController');

const verifyToken = require('../middleware/authMiddleware');

const verifyRole = require('../middleware/authorization');

const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');

const {
    loginLimiter,
    progressiveLoginLimiter
} = require('../middleware/rateLimiterMiddleware');

const router = express.Router();

router.post(
    '/login',
    progressiveLoginLimiter,
    loginLimiter,
    loginValidation,
    loginUser
);

router.route('/').post(registerValidation, createUser);

router.route('/').get(verifyToken, verifyRole('Admin'), getUsers);

router.route('/:id')
    .get(verifyToken, verifyRole('Admin', 'Seller', 'buyer'), getUserById)
    .put(verifyToken, verifyRole('Admin', 'Seller'), updateUser)
    .delete(verifyToken, verifyRole('Admin'), deleteUser);

module.exports = router;