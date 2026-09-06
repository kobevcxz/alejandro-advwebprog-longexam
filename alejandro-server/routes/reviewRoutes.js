const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Get all reviews (Admin Dashboard)
router.get("/", reviewController.getAllReviews);

// Get reviews by product ID
router.get(
    "/product/:productId",
    reviewController.getReviewsByProduct
);

// Create new review
router.post("/", reviewController.createReview);

// Update review
router.put("/:id", reviewController.updateReview);

// Delete review
router.delete("/:id", reviewController.deleteReview);

module.exports = router;