const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: Number,
    price: Number
});

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        shippingAddress: String,
        paymentMethod: {
            type: String,
            enum: ["Cash", "GCash", "Card"]
        },
        orderStatus: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending"
        },
        orderDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

orderSchema.index({ buyer: 1 });

module.exports = mongoose.model("Order", orderSchema);