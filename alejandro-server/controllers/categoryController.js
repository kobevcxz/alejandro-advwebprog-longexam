const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const { HttpStatus } = require("../config/constants");

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const categories = await Category.find()
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: 1 });

        const total = await Category.countDocuments();

        res.status(HttpStatus.OK).json({
            success: true,
            data: categories,
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

// Get single category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Category not found"
            });
        }

        const productCount = await Product.countDocuments({ category: id });

        res.status(HttpStatus.OK).json({
            success: true,
            data: {
                ...category._doc,
                productCount
            }
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;

        if (!categoryName) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            categoryName: {
                $regex: categoryName,
                $options: "i"
            }
        });

        if (existingCategory) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = new Category({
            categoryName,
            description: description || ""
        });

        const savedCategory = await category.save();

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Category created successfully",
            data: savedCategory
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryName, description } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Category not found"
            });
        }

        if (categoryName && categoryName !== category.categoryName) {
            const existingCategory = await Category.findOne({
                categoryName: {
                    $regex: categoryName,
                    $options: "i"
                }
            });

            if (existingCategory) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Category name already exists"
                });
            }

            category.categoryName = categoryName;
        }

        if (description !== undefined) {
            category.description = description;
        }

        const updatedCategory = await category.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const productCount = await Product.countDocuments({
            category: id
        });

        if (productCount > 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: `Cannot delete category with ${productCount} products`
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};