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
