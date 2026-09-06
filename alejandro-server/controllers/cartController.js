const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: "products.product",
                select: "productName price images stock"
            })
            .populate("user", "firstName lastName email");

        if (!cart) {
            return res.status(HttpStatus.OK).json({
                success: true,
                data: {
                    user: userId,
                    products: [],
                    totalPrice: 0
                }
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Add product to cart
exports.addToCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Product ID is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                products: [{ product: productId, quantity }],
                totalPrice: product.price * quantity
            });
        } else {
            const existingItem = cart.products.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;

                if (product.stock < newQuantity) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        success: false,
                        message: "Insufficient stock for the requested quantity"
                    });
                }

                existingItem.quantity = newQuantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity
                });
            }

            let total = 0;
            for (let item of cart.products) {
                const prod = await Product.findById(item.product);
                total += prod.price * item.quantity;
            }
            cart.totalPrice = total;
        }

        const savedCart = await cart.save();

        const populatedCart = await savedCart.populate({
            path: "products.product",
            select: "productName price images stock"
        });

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product added to cart",
            data: populatedCart
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update product quantity in cart
exports.updateCartQuantity = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Valid quantity is required"
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        const cartItem = cart.products.find(
            item => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not in cart"
            });
        }

        const product = await Product.findById(productId);

        if (product.stock < quantity) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Insufficient stock"
            });
        }

        cartItem.quantity = quantity;

        let total = 0;
        for (let item of cart.products) {
            const prod = await Product.findById(item.product);
            total += prod.price * item.quantity;
        }
        cart.totalPrice = total;

        const updatedCart = await cart.save();

        const populatedCart = await updatedCart.populate({
            path: "products.product",
            select: "productName price images stock"
        });

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cart updated",
            data: populatedCart
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Remove product from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.products = cart.products.filter(
            item => item.product.toString() !== productId
        );

        let total = 0;
        for (let item of cart.products) {
            const product = await Product.findById(item.product);
            total += product.price * item.quantity;
        }
        cart.totalPrice = total;

        const updatedCart = await cart.save();

        const populatedCart = await updatedCart.populate({
            path: "products.product",
            select: "productName price images stock"
        });

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product removed from cart",
            data: populatedCart
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.products = [];
        cart.totalPrice = 0;

        await cart.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Cart cleared"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};