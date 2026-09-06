const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { HttpStatus } = require("../config/constants");

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(HttpStatus.OK).json({ users });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        if (!req.body.password) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Password is required'
            });
        }

        const hashedPassword = await bcrypt.hash(
            req.body.password,
            10
        );

        const user = await User.create({
            ...req.body,
            password: hashedPassword
        });

        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: 'Signup successful',
            user
        });

    } catch (error) {
        console.error(error);

        return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.status(HttpStatus.OK).json(user);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(HttpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(HttpStatus.FORBIDDEN).json({ message: 'Your account is inactive. Please contact support.' });
        }

        if (user.type === 'Viewer') {
            return res.status(HttpStatus.FORBIDDEN).json({
                message: 'Viewer accounts cannot log in.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, type: user.type }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(HttpStatus.OK).json({ 
            message: 'Login successful', 
            token, 
            type: user.type, 
            firstName: user.firstName 
        }); 
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, loginUser };