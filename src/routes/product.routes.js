const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/active", productController.getActiveProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
