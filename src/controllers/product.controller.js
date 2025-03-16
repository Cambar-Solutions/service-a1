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

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActiveProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Producto no encontrado." });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado." });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ error: "Producto no encontrado." });
        res.json({ message: "Producto eliminado exitosamente." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
