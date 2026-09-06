const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            required: true
        },
        description: String,
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            default: 0
        },
        images: [String],
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        category: {
            type: String,
            required: true
        },
        condition: {
            type: String,
            enum: ["New", "Used"]
        },
        status: {
            type: String,
            enum: ["Available", "Sold"],
            default: "Available"
        },
        reviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }],
    },
    {
        timestamps: true
    }
);

productSchema.index({ productName: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model("Product", productSchema);