import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createProduct, deleteProduct, getProductByDonorId, getProductById, getProducts } from '../controllers/ProductController.js';
import upload from '../middleware/multer.js';

const router = express.Router()

router.post("/", verifyToken, upload.array("images"), createProduct)

router.get("/", getProducts)

router.get("/my-products", verifyToken, getProductByDonorId);

router.get("/:id",getProductById)

router.delete("/:id", verifyToken, deleteProduct)

export default router