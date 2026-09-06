const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        products: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

cartSchema.index({ user: 1 });

module.exports = mongoose.model("Cart", cartSchema);