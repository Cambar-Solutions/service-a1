const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { uploadMiddleware } = require("../middlewares/upload.middleware"); // Importar solo el middleware de subida

router.post("/create", uploadMiddleware, productController.createProduct);
router.put("/update/:id", uploadMiddleware, productController.updateProduct);
router.get("/", productController.getAllProducts);
router.get("/active", productController.getActiveProducts);
router.get("/:id", productController.getProductById);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
