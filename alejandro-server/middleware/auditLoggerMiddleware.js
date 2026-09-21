const Log = require('../models/logModel');

const logger = {
    info: async (message, metadata = {}) => {
        try {
            await Log.create({
                level: 'info',
                message,
                metadata
            });
        } catch (error) {
            console.error('Failed to write info log:', error);
        }
    },

    warn: async (message, metadata = {}) => {
        try {
            await Log.create({
                level: 'warn',
                message,
                metadata
            });
        } catch (error) {
            console.error('Failed to write warn log:', error);
        }
    },

    error: async (message, metadata = {}) => {
        try {
            await Log.create({
                level: 'error',
                message,
                metadata
            });
        } catch (error) {
            console.error('Failed to write error log:', error);
        }
    }
};

const auditLoggerMiddleware = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;

        const logData = {
            method: req.method,
            path: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.id || null,
            email: req.user?.email || null,
            role: req.user?.role || null,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        };

        const message = `${req.method} ${req.originalUrl} - ${res.statusCode}`;

        if (res.statusCode >= 500) {
            logger.error(message, logData);
        } else if (res.statusCode >= 400) {
            logger.warn(message, logData);
        } else {
            logger.info(message, logData);
        }
    });

    next();
};

module.exports = {
    logger,
    auditLoggerMiddleware
};