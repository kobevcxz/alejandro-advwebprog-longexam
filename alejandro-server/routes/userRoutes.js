const express = require('express');
const { getUsers, getUserById, createUser, updateUser, deleteUser, loginUser } = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/authorization');

const router = express.Router();

router.post('/login', loginUser);
router.route('/').post(createUser);

router.route('/').get(verifyToken, verifyRole('Admin'), getUsers);

router.route('/:id')
    .get(verifyToken, verifyRole('Admin', 'Seller', 'buyer'), getUserById)
    .put(verifyToken, verifyRole('Admin', 'Seller'), updateUser)
    .delete(verifyToken, verifyRole('Admin'), deleteUser);

module.exports = router;