const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

exports.getAllProducts = async (req, res) => {
    try {
        const {
            category,
            supplier,
            priceMin,
            priceMax,
            status,
            page = 1,
            limit = 10,
            search,
            sort
        } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        let filter = {};

        if (category) {
            filter.category = { $regex: new RegExp(category, "i") };
        }

        if (supplier) {
            filter.supplier = supplier;
        }

        if (priceMin !== undefined || priceMax !== undefined) {
            filter.price = {};

            if (priceMin !== undefined) {
                filter.price.$gte = parseFloat(priceMin);
            }

            if (priceMax !== undefined) {
                filter.price.$lte = parseFloat(priceMax);
            }
        }

        if (status) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                {
                    productName: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort) {
            const sortParts = sort.split(',');
            sortOption = {};
            sortOption[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
        }

        const products = await Product.find(filter)
            .populate(
                "seller",
                "firstName lastName email contactNumber"
            )
            .populate({
                path: "reviews",
                select: "rating comment reviewer",
                populate: {
                    path: "reviewer",
                    select: "firstName lastName"
                }
            })
            .skip(skip)
            .limit(limitNumber)
            .sort(sortOption);

        const total = await Product.countDocuments(filter);

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Products retrieved successfully.",
            count: total,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate(
                "seller",
                "firstName lastName email contactNumber address"
            )
            .populate({
                path: "reviews",
                select: "rating comment reviewer createdAt",
                populate: {
                    path: "reviewer",
                    select: "firstName lastName"
                }
            });

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
            price,
            stock,
            images,
            seller,
            category,
            condition
        } = req.body;

        if (
            !productName ||
            price === undefined ||
            price === null ||
            !seller ||
            !category
        ) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "productName, price, seller, and category are required"
            });
        }

        const product = new Product({
            productName,
            description,
            price,
            stock,
            images: images || [],
            seller,
            category, // Saved directly as a plain text string
            condition,
            status: "Available"
        });

        const savedProduct = await product.save();

        const populatedProduct = await savedProduct.populate(
            "seller",
            "firstName lastName email"
        );

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct
        });

    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            productName,
            description,
            price,
            stock,
            images,
            category,
            condition,
            status
        } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        if (category !== undefined) {
            product.category = category; // Directly updates the category string
        }

        if (productName !== undefined) {
            product.productName = productName;
        }

        if (description !== undefined) {
            product.description = description;
        }

        if (price !== undefined) {
            product.price = price;
        }

        if (stock !== undefined) {
            product.stock = stock;
        }

        if (images !== undefined) {
            product.images = images;
        }

        if (condition !== undefined) {
            product.condition = condition;
        }

        if (status !== undefined) {
            product.status = status;
        }

        const updatedProduct = await product.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });

    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find({ seller: sellerId })
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({ seller: sellerId });

        res.status(HttpStatus.OK).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        const products = await Product.find({
            category: { $regex: new RegExp(categoryName, "i") }
        })
            .populate("seller", "firstName lastName")
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments({
            category: { $regex: new RegExp(categoryName, "i") }
        });

        res.status(HttpStatus.OK).json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};