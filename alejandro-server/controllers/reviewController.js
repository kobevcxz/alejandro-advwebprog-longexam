const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

// Get all reviews (for Admin Dashboard)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("product", "productName images price")
            .populate("reviewer", "firstName lastName")
            .sort({ createdAt: -1 });

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get reviews by a product ID
exports.getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate("reviewer", "firstName lastName")
            .sort({ createdAt: -1 });

        res.status(HttpStatus.OK).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { product, reviewer, rating, comment } = req.body;

        if (!product || !reviewer || !rating) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Product, reviewer, and rating are required"
            });
        }

        const productExists = await Product.findById(product);

        if (!productExists) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        const existingReview = await Review.findOne({
            product,
            reviewer
        });

        if (existingReview) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        const review = new Review({
            product,
            reviewer,
            rating,
            comment: comment || ""
        });

        const savedReview = await review.save();

        if (productExists.reviews) {
            productExists.reviews.push(savedReview._id);
            await productExists.save();
        }

        const populatedReview = await savedReview.populate([
            { path: "product", select: "productName images price" },
            { path: "reviewer", select: "firstName lastName" }
        ]);

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Review created successfully",
            data: populatedReview
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Review not found"
            });
        }

        if (rating) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        const updatedReview = await review.save();

        const populatedReview = await updatedReview.populate([
            { path: "product", select: "productName images price" },
            { path: "reviewer", select: "firstName lastName" }
        ]);

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Review updated successfully",
            data: populatedReview
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Review not found"
            });
        }

        await Product.findByIdAndUpdate(review.product, {
            $pull: {
                reviews: review._id
            }
        });

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};