import cloudinary from "../config/cloudinary.js";
import connectCloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js"

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, status, location, contact } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imageUrls  = []

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = file.buffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        const uploadRes = await cloudinary.uploader.upload(dataURI, {
          folder: "products",
        });

        imageUrls.push(uploadRes.secure_url);
      }
    }

    const product = new Product({
      name,
      description,
      category,
      imageUrl: imageUrls, 
      status: status || "available",
      location,
      contact,
      donorId: req.user.id,
      createdAt: new Date(),
    });

    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({message: 'Server error'})
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({message: 'Product not fond'})
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({message: 'Server error'})
  }
}

export const getProductByDonorId = async (req, res) => {
  try {
    const donorId = req.user.id

    const products = await Product.find({donorId})

    res.json(products)
  } catch (error) {
    console.error("Get products by donorId error:", error);
    res.status(500).json({ message: "Server error" + error});
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({message:"Product not found"})
    }
    await product.deleteOne()
    res.json({message: 'Product removed'})
  } catch (error) {
    res.status(500).json({message: 'Server error'})
  }
}

export const updateProduct = async (req, res) => {
  try {
    const {id} = req.params

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body, images: req.files?.map(f => f.filename) }, // ปรับตาม model ของคุณ
      { new: true }
    )

    if (!updateProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
}