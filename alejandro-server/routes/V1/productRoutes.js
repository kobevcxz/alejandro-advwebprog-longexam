const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

router.get("/", productController.getAllProducts);

router.get("/category/:categoryId", productController.getProductsByCategory);

router.get("/seller/:sellerId", productController.getProductsBySeller);

router.get("/:id", productController.getProductById);

router.post("/", productController.createProduct);

router.patch("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

module.exports = router;