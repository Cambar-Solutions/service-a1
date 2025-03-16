const Post = require("../models/post.model");

exports.createPost = async (req, res) => {
    try {
        console.log("Body recibido:", req.body);
        console.log("Archivo preview recibido:", req.file);

        const { name, description } = req.body;
        if (!name || !description) return res.status(400).json({ error: "Los campos 'name' y 'description' son obligatorios." });

        // Manejo de preview (imagen subida)
        let previewUrl = "";
        if (req.file) {
            previewUrl = `https://global-storage.r2.cloudflarestorage.com/${req.file.originalname}`;
        }

        const post = new Post({
            name,
            description,
            preview: previewUrl
        });

        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActivePosts = async (req, res) => {
    try {
        const posts = await Post.find({ isActive: true });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post no encontrado." });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ error: "Post no encontrado." });
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ error: "Post no encontrado." });
        res.json({ message: "Post eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
