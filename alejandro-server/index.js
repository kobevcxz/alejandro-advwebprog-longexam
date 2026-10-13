
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const articleRoutes = require("./routes/articleRoutes");
const productRoutes = require("./routes/V1/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const { auditLoggerMiddleware } = require("./middleware/auditLoggerMiddleware");

const app = express();

connectDB();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    frameguard: { action: "sameorigin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
    "http://localhost:5173",
    "https://alejandro-advwebprog-longexam-1774.vercel.app",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Accept",
    ],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(auditLoggerMiddleware);

app.get("/", (req, res) => {
    res.json({ message: "Backend is running!" });
});

app.use("/api/users", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/V1/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
