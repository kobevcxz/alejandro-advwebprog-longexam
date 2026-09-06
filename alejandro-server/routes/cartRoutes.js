const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Get user's cart
router.get("/:userId", cartController.getCart);

// Add product to cart
router.post("/:userId", cartController.addToCart);

// Update product quantity in cart
router.put("/:userId/:productId", cartController.updateCartQuantity);

// Remove product from cart
router.delete("/:userId/:productId", cartController.removeFromCart);

// Clear entire cart
router.delete("/:userId", cartController.clearCart);

module.exports = router;