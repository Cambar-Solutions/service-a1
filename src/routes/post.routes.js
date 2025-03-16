const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { uploadMiddleware } = require("../middlewares/upload.middleware");
const multer = require("multer");

// 🔥 Crear un middleware solo para preview
const uploadSingle = multer({ storage: multer.memoryStorage() }).single("preview");

router.post("/create", uploadSingle, postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/active", postController.getActivePosts);
router.get("/:id", postController.getPostById);
router.put("/update/:id", uploadSingle, postController.updatePost);
router.delete("/:id", postController.deletePost);

module.exports = router;
