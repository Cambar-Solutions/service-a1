const Product = require("../models/product.model");

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};

exports.getActiveProducts = async (req, res) => {
    const products = await Product.find({ isActive: true });
    res.json(products);
};

exports.getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);
    product ? res.json(product) : res.status(404).json({ message: "Not Found" });
};

exports.updateProduct = async (req, res) => {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
};
