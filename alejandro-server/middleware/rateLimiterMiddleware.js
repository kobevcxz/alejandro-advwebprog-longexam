const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    }
});

const failedAttempts = new Map();

const progressiveLoginLimiter = (req, res, next) => {
    const key = req.body.email || req.ip;
    const record = failedAttempts.get(key);

    if (record && record.lockUntil && Date.now() < record.lockUntil) {
        const remainingMs = record.lockUntil - Date.now();
        const remainingMinutes = Math.ceil(remainingMs / 60000);

        return res.status(429).json({
            success: false,
            message: `Too many failed login attempts. Please try again after ${remainingMinutes} minute(s).`
        });
    }

    if (record && record.lockUntil && Date.now() >= record.lockUntil) {
        record.lockUntil = null;
        failedAttempts.set(key, record);
    }

    next();
};

const recordFailedLogin = (key) => {
    const record = failedAttempts.get(key) || {
        attempts: 0,
        lockUntil: null
    };

    record.attempts += 1;

    if (record.attempts >= 10) {
        record.lockUntil = Date.now() + 30 * 60 * 1000;
    } else if (record.attempts >= 8) {
        record.lockUntil = Date.now() + 5 * 60 * 1000;
    } else if (record.attempts >= 5) {
        record.lockUntil = Date.now() + 3 * 60 * 1000;
    }

    failedAttempts.set(key, record);

    return record;
};

const resetFailedLogin = (key) => {
    failedAttempts.delete(key);
};

module.exports = {
    loginLimiter,
    progressiveLoginLimiter,
    recordFailedLogin,
    resetFailedLogin
};