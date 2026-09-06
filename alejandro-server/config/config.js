require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

module.exports = {
    MONGO_URI,
    PORT,
    JWT_SECRET,
    NODE_ENV,
};