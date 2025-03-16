const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    preview: { 
        id: { type: String, required: true },
        url: { type: String, required: true },
        tipo: { type: String, required: true }
    },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Post", postSchema);
