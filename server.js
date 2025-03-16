const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const multer = require("multer");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Permite recibir form-data

// Configurar Multer para manejar archivos (imágenes y videos)
const storage = multer.memoryStorage(); // Guarda los archivos en memoria antes de subirlos a Cloudflare
const upload = multer({ storage });

app.use("/api/products", upload.array("multimedia"), require("./src/routes/product.routes")); // Permite subir múltiples imágenes
app.use("/api/posts", upload.single("preview"), require("./src/routes/post.routes")); // Permite subir 1 imagen para el preview
app.use("/api/upload", upload.single("file"), require("./src/routes/upload.routes")); // Ruta para subir archivos a Cloudflare

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
