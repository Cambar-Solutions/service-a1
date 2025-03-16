const Post = require("../models/post.model");
const { uploadToCloudflare } = require("../middlewares/upload.middleware");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/cloudflare");

exports.createPost = async (req, res) => {
    try {
        console.log("Body recibido:", req.body);
        console.log("Archivo preview recibido:", req.file);

        const { name, description } = req.body;
        if (!name || !description) return res.status(400).json({ error: "Los campos 'name' y 'description' son obligatorios." });

        let preview = null;

        // 🔥 1️⃣ Subir imagen de preview si se envía
        if (req.file) {
            preview = await uploadToCloudflare(req.file);
        }

        const post = new Post({
            name,
            description,
            preview
        });

        await post.save();
        res.status(201).json({
            message: "✅ Post creado exitosamente",
            post
        });

    } catch (error) {
        console.error("❌ Error en createPost:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { name, description } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ error: "Post no encontrado." });

        let preview = post.preview; // Mantiene la imagen previa

        // 🔥 1️⃣ Si se envía una nueva imagen, eliminar la anterior y subir la nueva
        if (req.file) {
            if (post.preview) {
                try {
                    await s3.send(new DeleteObjectCommand({
                        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                        Key: post.preview.id
                    }));
                    console.log(`✅ Imagen eliminada: ${post.preview.id}`);
                } catch (error) {
                    console.error(`⚠️ Error eliminando imagen previa:`, error);
                }
            }
            preview = await uploadToCloudflare(req.file);
        }

        // 🔥 2️⃣ Actualizar el post
        post.name = name || post.name;
        post.description = description || post.description;
        post.preview = preview;

        const updatedPost = await post.save();
        res.json({
            message: "✅ Post actualizado exitosamente",
            post: updatedPost
        });

    } catch (error) {
        console.error("❌ Error en updatePost:", error);
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

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: "Post no encontrado." });

        // 🔥 1️⃣ Eliminar imagen de preview de Cloudflare R2 si existe
        if (post.preview) {
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                    Key: post.preview.id
                }));
                console.log(`✅ Imagen eliminada: ${post.preview.id}`);
            } catch (error) {
                console.error(`⚠️ Error eliminando imagen previa:`, error);
            }
        }

        res.json({ message: "✅ Post eliminado exitosamente." });

    } catch (error) {
        console.error("❌ Error en deletePost:", error);
        res.status(500).json({ error: error.message });
    }
};
