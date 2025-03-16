const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // Guarda un iframe
    preview: { type: String, required: true }, // URL de imagen
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Post", PostSchema);
