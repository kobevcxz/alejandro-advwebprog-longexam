const express = require("express");
const router = express.Router();

const productController = require("../../controllers/productController");

const verifyToken = require("../../middleware/authMiddleware");
const verifyRole = require("../../middleware/authorization");

const {
    upload,
    validateImageContent,
    handleUploadError
} = require("../../middleware/uploadImageMiddleware");

router.get("/", productController.getAllProducts);

router.get(
    "/category/:categoryId",
    productController.getProductsByCategory
);

router.get(
    "/seller/:sellerId",
    productController.getProductsBySeller
);

router.post(
    "/:id/upload-image",
    verifyToken,
    verifyRole("Admin", "Seller"),
    upload.single("image"),
    validateImageContent,
    productController.uploadProductImage
);

router.patch(
    "/:id/images/:imageIndex",
    verifyToken,
    verifyRole("Admin", "Seller"),
    upload.single("image"),
    validateImageContent,
    productController.replaceProductImage
);

router.delete(
    "/:id/images/:imageIndex",
    verifyToken,
    verifyRole("Admin", "Seller"),
    productController.deleteProductImage
);

router.get(
    "/:id",
    productController.getProductById
);

router.post(
    "/",
    productController.createProduct
);

router.patch(
    "/:id",
    productController.updateProduct
);

router.delete(
    "/:id",
    productController.deleteProduct
);

router.use(handleUploadError);

module.exports = router;