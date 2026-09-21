const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Log', logSchema);