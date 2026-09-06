const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Get all orders
router.get("/", orderController.getAllOrders);

// Get orders by buyer ID
router.get("/user/:buyerId", orderController.getOrdersByBuyer);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

// Create new order
router.post("/", orderController.createOrder);

// Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// Cancel order
router.delete("/:id", orderController.cancelOrder);

module.exports = router;