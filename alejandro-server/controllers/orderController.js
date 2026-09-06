const mongoose = require("mongoose");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        let filter = {};

        if (status) {
            filter.orderStatus = status;
        }

        const orders = await Order.find(filter)
            .populate("buyer", "firstName lastName email contactNumber")
            .populate({
                path: "products.product",
                select: "productName price images"
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate(
                "buyer",
                "firstName lastName email contactNumber address"
            )
            .populate({
                path: "products.product",
                select: "productName price images description"
            });

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Get orders by buyer (Fixed to handle both String and ObjectId matching)
exports.getOrdersByBuyer = async (req, res) => {
    try {
        const { buyerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const queryFilter = {
            $or: [
                { buyer: buyerId },
                ...(mongoose.Types.ObjectId.isValid(buyerId) ? [{ buyer: new mongoose.Types.ObjectId(buyerId) }] : [])
            ]
        };

        const orders = await Order.find(queryFilter)
            .populate({
                path: "products.product",
                select: "productName price images"
            })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(queryFilter);

        res.status(HttpStatus.OK).json({
            success: true,
            data: orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const {
            buyer,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod
        } = req.body;

        if (
            !buyer ||
            !products ||
            products.length === 0 ||
            !totalAmount ||
            !shippingAddress ||
            !paymentMethod
        ) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Please provide all required order fields"
            });
        }

        for (let item of products) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.productName}`
                });
            }

            product.stock -= item.quantity;

            if (product.stock === 0) {
                product.status = "Sold";
            }

            await product.save();
        }

        const order = new Order({
            buyer,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: "Pending"
        });

        const savedOrder = await order.save();

        await Cart.findOneAndUpdate(
            { user: buyer },
            { products: [], totalPrice: 0 }
        );

        const populatedOrder = await savedOrder.populate({
            path: "products.product",
            select: "productName price images"
        });

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Order placed successfully",
            data: populatedOrder
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body;

        const validStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!orderStatus || !validStatuses.includes(orderStatus)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid or missing order status"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        order.orderStatus = orderStatus;

        const updatedOrder = await order.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Order not found"
            });
        }

        if (
            order.orderStatus === "Shipped" ||
            order.orderStatus === "Delivered"
        ) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Cannot cancel order that has already been shipped or delivered"
            });
        }

        for (let item of order.products) {
            const product = await Product.findById(item.product);

            if (product) {
                product.stock += item.quantity;

                if (product.status === "Sold" && product.stock > 0) {
                    product.status = "Available";
                }

                await product.save();
            }
        }

        order.orderStatus = "Cancelled";
        await order.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Order cancelled successfully",
            data: order
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};