const mongoose = require("mongoose");

const MultimediaSchema = new mongoose.Schema({
    id: String,
    url: String,
    tipo: { type: String, enum: ["imagen", "video"], required: true }
});

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    multimedia: [MultimediaSchema],
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Product", ProductSchema);
