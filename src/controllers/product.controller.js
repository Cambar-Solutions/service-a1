const Product = require("../models/product.model");
const { uploadToCloudflare } = require("../middlewares/upload.middleware");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3"); // 💡 Importa DeleteObjectCommand
const s3 = require("../config/cloudflare");

exports.createProduct = async (req, res) => {
  try {
    console.log("Body recibido:", req.body);
    console.log("Archivos recibidos:", req.files);

    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ error: "El campo 'name' es obligatorio." });

    let multimedia = [];

    if (req.files && req.files.length > 0) {
      multimedia = await Promise.all(req.files.map(uploadToCloudflare));
    }

    console.log("Multimedia procesada:", multimedia);

    const product = new Product({ name, description, multimedia });

    await product.save();

    res.status(201).json({ message: "Producto creado exitosamente", product });
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, multimedia: updatedMultimedia } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ error: "Producto no encontrado." });

        let multimedia = product.multimedia; 
        let newImages = updatedMultimedia ? JSON.parse(updatedMultimedia) : []; 

        // 🔥 1️⃣ Eliminar imágenes antiguas de Cloudflare R2 si ya no están en la actualización
        const oldImages = product.multimedia.map(file => file.id);
        const newImageIds = newImages.map(file => file.id);
        const imagesToDelete = oldImages.filter(id => !newImageIds.includes(id));

        await Promise.all(imagesToDelete.map(async (imageId) => {
            try {
                await s3.send(new DeleteObjectCommand({ // ✅ Corrección aquí
                    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                    Key: imageId
                }));
                console.log(`✅ Imagen eliminada: ${imageId}`);
            } catch (error) {
                console.error(`⚠️ Error eliminando imagen ${imageId}:`, error);
            }
        }));

        // 🔥 2️⃣ Subir nuevas imágenes a Cloudflare R2 si se enviaron en `req.files`
        if (req.files && req.files.length > 0) {
            const uploadedImages = await Promise.all(req.files.map(uploadToCloudflare));
            multimedia = [...newImages, ...uploadedImages]; 
        } else {
            multimedia = newImages; 
        }

        // 🔥 3️⃣ Actualizar el producto
        product.name = name || product.name;
        product.description = description || product.description;
        product.multimedia = multimedia;

        const updatedProduct = await product.save();
        res.json({
            message: "✅ Producto actualizado exitosamente",
            product: updatedProduct
        });

    } catch (error) {
        console.error("❌ Error en updateProduct:", error);
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
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado." });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Producto no encontrado." });

    // Eliminar imágenes de Cloudflare
    await Promise.all(
      product.multimedia.map(async (file) => {
        await s3
          .deleteObject({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: file.id,
          })
          .promise();
      })
    );

    res.json({ message: "Producto eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
