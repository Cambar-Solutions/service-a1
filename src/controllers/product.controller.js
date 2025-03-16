const Product = require("../models/product.model");

exports.createProduct = async (req, res) => {
    try {
        console.log("Body recibido:", req.body);
        console.log("Archivos recibidos:", req.files);

        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: "El campo 'name' es obligatorio." });

        // Mapear archivos a formato multimedia
        const multimedia = req.files.map(file => ({
            id: file.originalname,
            url: `https://global-storage.r2.cloudflarestorage.com/${file.originalname}`,
            tipo: file.mimetype.startsWith("image/") ? "imagen" : "video"
        }));

        const product = new Product({
            name,
            description,
            multimedia
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
